import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, type AppStateStatus, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  checkBookingPaymentOnce,
  pollBookingPayment,
  startPaymentPoller,
} from '@/lib/booking-payment';
import { formatPaise } from '@/lib/currency';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import type { Booking, PaymentStatus } from '@/types/booking';

type ResultState = 'loading' | PaymentStatus | 'ABANDONED';

function parseInitialStatus(value?: string): ResultState {
  if (value === 'PAID' || value === 'FAILED') {
    return value;
  }
  return 'loading';
}

function isTerminal(status: ResultState): status is PaymentStatus {
  return status === 'PAID' || status === 'FAILED';
}

export default function PaymentResultScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const { bookingId, orderId: orderIdParam, status: statusParam } = useLocalSearchParams<{
    bookingId?: string;
    orderId?: string;
    status?: string;
  }>();
  const [status, setStatus] = useState<ResultState>(() => parseInitialStatus(statusParam));
  const [orderId, setOrderId] = useState(orderIdParam ?? '');
  const [totalPaise, setTotalPaise] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const leftAppForPaymentRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const applyBooking = useCallback((booking: Pick<Booking, 'orderId' | 'pricing' | 'paymentUrl'>) => {
    setTotalPaise(booking.pricing.totalPaise);
    if (booking.orderId) setOrderId(booking.orderId);
    setPaymentUrl(booking.paymentUrl ?? null);
  }, []);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    let cancelled = false;

    void checkBookingPaymentOnce(bookingId)
      .then(({ status: paymentStatus, booking }) => {
        if (cancelled) return;
        applyBooking(booking);
        if (isTerminal(paymentStatus)) {
          setStatus(paymentStatus);
        }
      })
      .catch(() => {
        // Keep the current UI state; live poller / retry will handle recovery.
      });

    return () => {
      cancelled = true;
    };
  }, [applyBooking, bookingId]);

  useEffect(() => {
    if (!bookingId) {
      setStatus('FAILED');
      return;
    }

    if (statusParam === 'PAID' || statusParam === 'FAILED') {
      return;
    }

    const stop = startPaymentPoller(bookingId, {
      onUpdate: (booking, paymentStatus) => {
        applyBooking(booking);
        setStatus((current) => {
          if (isTerminal(paymentStatus)) {
            return paymentStatus;
          }
          return current === 'ABANDONED' ? 'ABANDONED' : 'PENDING';
        });
      },
      onTerminal: ({ status: paymentStatus, booking }) => {
        applyBooking(booking);
        setStatus(paymentStatus);
      },
    });

    return stop;
  }, [applyBooking, bookingId, statusParam]);

  useEffect(() => {
    if (!bookingId || statusParam === 'PAID' || statusParam === 'FAILED') {
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
          const { status: paymentStatus, booking } = await checkBookingPaymentOnce(bookingId);
          applyBooking(booking);
          if (isTerminal(paymentStatus)) {
            setStatus(paymentStatus);
            return;
          }
          setStatus('ABANDONED');
        } catch {
          setStatus('ABANDONED');
        }
      })();
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [applyBooking, bookingId, statusParam]);

  const isSuccess = status === 'PAID';
  const isFailed = status === 'FAILED';
  const isPending = status === 'PENDING';
  const isAbandoned = status === 'ABANDONED';
  const isLoading = status === 'loading';

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
      ? t('paymentResult.successBody')
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
    if (!bookingId) return;
    setStatus('loading');
    try {
      const quick = await checkBookingPaymentOnce(bookingId);
      applyBooking(quick.booking);
      if (isTerminal(quick.status)) {
        setStatus(quick.status);
        return;
      }

      const { status: paymentStatus, booking } = await pollBookingPayment(bookingId, applyBooking);
      applyBooking(booking);
      setStatus(isTerminal(paymentStatus) ? paymentStatus : 'PENDING');
    } catch {
      setStatus('FAILED');
    }
  }

  function handleContinuePayment() {
    if (!bookingId) {
      return;
    }
    router.replace({
      pathname: '/payment/checkout',
      params: {
        bookingId,
        orderId,
      },
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
