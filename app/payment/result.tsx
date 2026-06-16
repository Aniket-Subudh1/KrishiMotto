import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, type AppStateStatus, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  buildPaymentResultParams,
  checkPaymentOnce,
  confirmFailedPaymentForSession,
  parsePaymentSession,
  pollPaymentForSession,
  startPaymentPollerForSession,
  toPaymentSessionSnapshot,
  type PaymentSessionSnapshot,
} from '@/lib/payment-session';
import { formatPaise } from '@/lib/currency';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import type { PaymentStatus } from '@/types/booking';

type ResultState = 'loading' | PaymentStatus | 'ABANDONED';

function parseInitialStatus(value?: string): ResultState {
  if (value === 'PAID') {
    return value;
  }
  // FAILED deep links can arrive before the gateway settles after UPI return.
  return 'loading';
}

function isTerminal(status: ResultState): status is PaymentStatus {
  return status === 'PAID' || status === 'FAILED';
}

export default function PaymentResultScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const {
    bookingId,
    storageRequestId,
    orderId: orderIdParam,
    status: statusParam,
  } = useLocalSearchParams<{
    bookingId?: string;
    storageRequestId?: string;
    orderId?: string;
    status?: string;
  }>();

  const session = useMemo(
    () => parsePaymentSession({ bookingId, storageRequestId }),
    [bookingId, storageRequestId],
  );

  const [status, setStatus] = useState<ResultState>(() => parseInitialStatus(statusParam));
  const [orderId, setOrderId] = useState(orderIdParam ?? '');
  const [totalPaise, setTotalPaise] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const leftAppForPaymentRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const applySnapshot = useCallback((snapshot: PaymentSessionSnapshot) => {
    setTotalPaise(snapshot.totalPaise);
    if (snapshot.orderId) setOrderId(snapshot.orderId);
    setPaymentUrl(snapshot.paymentUrl);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    void checkPaymentOnce(session)
      .then(async (result) => {
        if (cancelled) return;
        applySnapshot(toPaymentSessionSnapshot(result));

        if (result.status === 'PAID') {
          setStatus('PAID');
          return;
        }
        if (result.status === 'FAILED') {
          const confirmed = await confirmFailedPaymentForSession(session);
          if (cancelled) return;
          applySnapshot(toPaymentSessionSnapshot(confirmed));
          if (isTerminal(confirmed.status)) {
            setStatus(confirmed.status);
          }
        }
      })
      .catch(() => {
        // Keep the current UI state; live poller / retry will handle recovery.
      });

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, session]);

  useEffect(() => {
    if (!session) {
      setStatus('FAILED');
      return;
    }

    if (statusParam === 'PAID') {
      return;
    }

    const stop = startPaymentPollerForSession(session, {
      onUpdate: (snapshot, paymentStatus) => {
        applySnapshot(snapshot);
        setStatus((current) => {
          if (paymentStatus === 'PAID') {
            return 'PAID';
          }
          if (paymentStatus === 'FAILED') {
            return current;
          }
          return current === 'ABANDONED' ? 'ABANDONED' : 'PENDING';
        });
      },
      onTerminal: (result) => {
        applySnapshot(toPaymentSessionSnapshot(result));
        setStatus(result.status);
      },
    });

    return stop;
  }, [applySnapshot, session, statusParam]);

  useEffect(() => {
    if (!session || statusParam === 'PAID') {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (previousState === 'active' && nextState !== 'active') {
        leftAppForPaymentRef.current = true;
        return;
      }

      if (nextState !== 'active' || !leftAppForPaymentRef.current) {
        return;
      }

      leftAppForPaymentRef.current = false;

      void (async () => {
        try {
          const result = await checkPaymentOnce(session);
          applySnapshot(toPaymentSessionSnapshot(result));

          if (result.status === 'PAID') {
            setStatus('PAID');
            return;
          }
          if (result.status === 'FAILED') {
            const confirmed = await confirmFailedPaymentForSession(session);
            applySnapshot(toPaymentSessionSnapshot(confirmed));

            if (confirmed.status === 'PAID') {
              setStatus('PAID');
              return;
            }
            if (confirmed.status === 'FAILED') {
              setStatus('FAILED');
              return;
            }
          }
          setStatus('ABANDONED');
        } catch {
          setStatus('ABANDONED');
        }
      })();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [applySnapshot, session, statusParam]);

  const isSuccess = status === 'PAID';
  const isFailed = status === 'FAILED';
  const isPending = status === 'PENDING';
  const isAbandoned = status === 'ABANDONED';
  const isLoading = status === 'loading';
  const isStorageSession = session?.kind === 'storage';

  const title = isLoading
    ? t('paymentResult.loadingTitle')
    : isSuccess
      ? t('paymentResult.successTitle')
      : isFailed
        ? t('paymentResult.failedTitle')
        : isAbandoned
          ? t('paymentResult.abandonedTitle')
          : t('paymentResult.pendingTitle');

  const body = isLoading
    ? t('paymentResult.loadingBody')
    : isSuccess
      ? isStorageSession
        ? t('paymentResult.storageSuccessBody')
        : t('paymentResult.successBody')
      : isFailed
        ? t('paymentResult.failedBody')
        : isAbandoned
          ? t('paymentResult.abandonedBody')
          : t('paymentResult.pendingBody');

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isFailed
      ? 'close-circle'
      : isAbandoned
        ? 'alert-circle'
        : 'time-outline';
  const iconColor = isSuccess
    ? Palette.indiaGreen
    : isFailed
      ? '#EF4444'
      : isAbandoned
        ? Palette.saffron
        : Palette.marigold;

  async function handleRetry() {
    if (!session) return;
    setStatus('loading');
    try {
      const quick = await checkPaymentOnce(session);
      applySnapshot(toPaymentSessionSnapshot(quick));

      if (isTerminal(quick.status)) {
        if (quick.status === 'FAILED') {
          const confirmed = await confirmFailedPaymentForSession(session);
          applySnapshot(toPaymentSessionSnapshot(confirmed));
          if (isTerminal(confirmed.status)) {
            setStatus(confirmed.status);
            return;
          }
        } else {
          setStatus(quick.status);
          return;
        }
      }

      const result = await pollPaymentForSession(session, applySnapshot);
      applySnapshot(toPaymentSessionSnapshot(result));
      setStatus(isTerminal(result.status) ? result.status : 'PENDING');
    } catch {
      setStatus('FAILED');
    }
  }

  function handleContinuePayment() {
    if (!session) {
      return;
    }
    router.replace({
      pathname: '/payment/checkout',
      params: buildPaymentResultParams(session, 'PENDING', {
        orderId,
        paymentUrl,
        totalPaise: totalPaise ?? 0,
      }),
    });
  }

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 24, paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <Text className="text-center text-[22px] font-bold text-white">{t('paymentResult.header')}</Text>
      </LinearGradient>

      <View className="flex-1 items-center justify-center px-6" style={{ marginTop: -24 }}>
        <View
          className="w-full max-w-[400px] items-center rounded-3xl border border-border bg-white px-6 py-8"
          style={{
            shadowColor: Palette.indigo,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={Palette.indiaGreen} />
          ) : (
            <Ionicons name={iconName} size={72} color={iconColor} />
          )}

          <Text className="mt-5 text-center text-[22px] font-bold text-indigo">{title}</Text>
          <Text className="mt-2 text-center text-[15px] leading-6 text-muted">{body}</Text>

          {orderId ? (
            <Text className="mt-4 text-center text-[13px] font-medium text-indigo">
              {t('paymentResult.orderRef').replace('{{orderId}}', orderId)}
            </Text>
          ) : null}

          {totalPaise != null && isSuccess ? (
            <Text className="mt-2 text-center text-[20px] font-bold text-india-green">
              {formatPaise(totalPaise)}
            </Text>
          ) : null}

          {!isLoading ? (
            <View className="mt-8 w-full gap-3">
              {isSuccess && isStorageSession ? (
                <Button
                  size="lg"
                  className="w-full"
                  onPress={() => router.replace('/services/crop-tracker')}
                >
                  {t('paymentResult.openCropTracker')}
                </Button>
              ) : null}
              <Button size="lg" className="w-full" onPress={() => router.replace('/(tabs)')}>
                {t('paymentResult.goHome')}
              </Button>
              {(isPending || isAbandoned) && paymentUrl ? (
                <Button variant="secondary" size="lg" className="w-full" onPress={handleContinuePayment}>
                  {t('paymentResult.continuePayment')}
                </Button>
              ) : null}
              {(isPending || isAbandoned) ? (
                <Button variant="secondary" size="lg" className="w-full" onPress={handleRetry}>
                  {t('paymentResult.retryCheck')}
                </Button>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
