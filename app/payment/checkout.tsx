import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ExpoLinking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    AppState,
    Linking,
    Pressable,
    View,
    type AppStateStatus,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type {
    ShouldStartLoadRequest,
    WebViewNavigation,
} from "react-native-webview/lib/WebViewTypes";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AppBarGradient, Palette } from "@/constants/theme";
import { useAppLocale } from "@/hooks/use-app-locale";
import {
    buildPaymentResultParams,
    checkPaymentOnce,
    confirmFailedPaymentForSession,
    parsePaymentSession,
    startPaymentPollerForSession,
    toPaymentSessionSnapshot,
    type PaymentSessionRef,
} from "@/lib/payment-session";
import type { PaymentStatus } from "@/types/booking";

type CheckoutState = "loading" | "ready" | "returning" | "error";

function isTerminalStatus(status: PaymentStatus) {
  return status === "PAID" || status === "FAILED";
}

function isExternalScheme(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return !(
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("about:blank") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:")
  );
}

export default function PaymentCheckoutScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const leftForExternalPaymentRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const { bookingId, storageRequestId, orderId: orderIdParam } = useLocalSearchParams<{
    bookingId?: string;
    storageRequestId?: string;
    orderId?: string;
  }>();

  const session = useMemo(
    () => parsePaymentSession({ bookingId, storageRequestId }),
    [bookingId, storageRequestId],
  );

  const [checkoutState, setCheckoutState] = useState<CheckoutState>("loading");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState(orderIdParam ?? "");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const headerTitle = useMemo(
    () =>
      checkoutState === "returning"
        ? t("paymentCheckout.returningTitle")
        : t("paymentCheckout.title"),
    [checkoutState, t],
  );

  const navigateToResult = useCallback(
    (
      status: PaymentStatus,
      activeSession: PaymentSessionRef,
      nextOrderId: string,
    ) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      router.replace({
        pathname: "/payment/result",
        params: buildPaymentResultParams(activeSession, status, {
          orderId: nextOrderId,
          paymentUrl,
          totalPaise: 0,
        }),
      });
    },
    [paymentUrl],
  );

  const syncPaymentState = useCallback(
    async (activeSession: PaymentSessionRef, showAbandonedOnPending = false) => {
      try {
        const result = await checkPaymentOnce(activeSession);
        const snapshot = toPaymentSessionSnapshot(result);

        if (snapshot.orderId) {
          setOrderId(snapshot.orderId);
        }
        if (snapshot.paymentUrl) {
          setPaymentUrl(snapshot.paymentUrl);
        }

        if (isTerminalStatus(result.status)) {
          if (result.status === "FAILED") {
            const confirmed = await confirmFailedPaymentForSession(activeSession);
            const confirmedSnapshot = toPaymentSessionSnapshot(confirmed);

            if (confirmed.status === "PAID") {
              navigateToResult("PAID", activeSession, confirmedSnapshot.orderId);
              return;
            }
            if (confirmed.status === "FAILED") {
              navigateToResult("FAILED", activeSession, confirmedSnapshot.orderId);
              return;
            }
            if (showAbandonedOnPending) {
              setCheckoutState("ready");
              setInfoMessage(t("paymentCheckout.notCompletedBody"));
            }
            return;
          }

          navigateToResult(result.status, activeSession, snapshot.orderId);
          return;
        }

        if (showAbandonedOnPending) {
          setCheckoutState("ready");
          setInfoMessage(t("paymentCheckout.notCompletedBody"));
        } else {
          setCheckoutState((current) =>
            current === "loading" ? "ready" : current,
          );
        }
      } catch {
        setCheckoutState("error");
        setInfoMessage(t("paymentCheckout.loadError"));
      }
    },
    [navigateToResult, t],
  );

  useEffect(() => {
    if (!session) {
      setCheckoutState("error");
      setInfoMessage(t("paymentCheckout.missingSession"));
      return;
    }

    void syncPaymentState(session);
  }, [session, syncPaymentState, t]);

  useEffect(() => {
    if (!session) return;

    const stop = startPaymentPollerForSession(session, {
      onUpdate: (snapshot, status) => {
        if (snapshot.orderId) {
          setOrderId(snapshot.orderId);
        }
        if (snapshot.paymentUrl) {
          setPaymentUrl(snapshot.paymentUrl);
        }
        if (!isTerminalStatus(status) && checkoutState === "loading") {
          setCheckoutState("ready");
        }
      },
      onTerminal: (result) => {
        navigateToResult(result.status, session, toPaymentSessionSnapshot(result).orderId);
      },
    });

    return stop;
  }, [checkoutState, navigateToResult, orderId, session]);

  useEffect(() => {
    if (!session) return;

    const handleAppState = (nextState: AppStateStatus) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;

      if (previous === "active" && nextState !== "active") {
        leftForExternalPaymentRef.current = true;
        return;
      }

      if (nextState !== "active" || !leftForExternalPaymentRef.current) {
        return;
      }

      leftForExternalPaymentRef.current = false;
      setCheckoutState("returning");
      setInfoMessage(t("paymentCheckout.returningBody"));
      void syncPaymentState(session, true);
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [session, syncPaymentState, t]);

  const handleShouldStartLoad = useCallback(
    (request: ShouldStartLoadRequest) => {
      const url = request.url;

      if (url.startsWith("krishimotto://")) {
        const parsed = ExpoLinking.parse(url);
        const status = parsed.queryParams?.status;
        const deepLinkBookingId = parsed.queryParams?.bookingId;
        const deepLinkStorageRequestId = parsed.queryParams?.storageRequestId;
        const deepLinkOrderId = parsed.queryParams?.orderId;

        const deepLinkSession = parsePaymentSession({
          bookingId:
            typeof deepLinkBookingId === "string" ? deepLinkBookingId : undefined,
          storageRequestId:
            typeof deepLinkStorageRequestId === "string"
              ? deepLinkStorageRequestId
              : undefined,
        });

        if (
          typeof status === "string" &&
          (status === "PAID" || status === "FAILED") &&
          deepLinkSession
        ) {
          void (async () => {
            const verified =
              status === "FAILED"
                ? await confirmFailedPaymentForSession(deepLinkSession)
                : await checkPaymentOnce(deepLinkSession);

            if (!isTerminalStatus(verified.status)) {
              return;
            }

            const verifiedOrderId = toPaymentSessionSnapshot(verified).orderId;

            navigateToResult(
              verified.status,
              deepLinkSession,
              verifiedOrderId ||
                (typeof deepLinkOrderId === "string" ? deepLinkOrderId : orderId),
            );
          })();
        }
        return false;
      }

      if (isExternalScheme(url)) {
        leftForExternalPaymentRef.current = true;
        setInfoMessage(t("paymentCheckout.externalAppHint"));
        setCheckoutState("returning");
        void Linking.openURL(url).catch(() => {
          setCheckoutState("ready");
          setInfoMessage(t("paymentCheckout.externalAppError"));
        });
        return false;
      }

      return true;
    },
    [navigateToResult, orderId, t],
  );

  const handleNavigationChange = useCallback(
    (navigation: WebViewNavigation) => {
      if (isExternalScheme(navigation.url)) {
        setCheckoutState("returning");
      } else if (!navigation.loading) {
        setCheckoutState("ready");
      }
    },
    [],
  );

  function handleRetryLoad() {
    if (!session) return;
    setCheckoutState("loading");
    setInfoMessage(null);
    webViewRef.current?.reload();
    void syncPaymentState(session);
  }

  function handleGoResult() {
    if (!session) return;
    router.replace({
      pathname: "/payment/result",
      params: buildPaymentResultParams(session, "PENDING", {
        orderId,
        paymentUrl,
        totalPaise: 0,
      }),
    });
  }

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="card-outline" size={20} color="#FFFFFF" />
          </View>
        </View>

        <Text className="mt-4 text-[24px] font-bold text-white">
          {headerTitle}
        </Text>
        <Text className="mt-1 text-[14px] text-white/85">
          {orderId
            ? t("paymentCheckout.orderRef").replace("{{orderId}}", orderId)
            : t("paymentCheckout.subtitle")}
        </Text>
      </LinearGradient>

      <View className="flex-1">
        {paymentUrl ? (
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            className="flex-1"
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={handleNavigationChange}
            onError={() => {
              setCheckoutState("error");
              setInfoMessage(t("paymentCheckout.loadError"));
            }}
            onHttpError={() => {
              setCheckoutState("error");
              setInfoMessage(t("paymentCheckout.httpError"));
            }}
            renderLoading={() => (
              <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color={Palette.indiaGreen} />
                <Text className="mt-3 text-[14px] text-muted">
                  {t("paymentCheckout.loadingPage")}
                </Text>
              </View>
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color={Palette.indiaGreen} />
            <Text className="mt-3 text-center text-[14px] text-muted">
              {t("paymentCheckout.fetchingUrl")}
            </Text>
          </View>
        )}

        <View className="border-t border-border bg-white px-5 py-4">
          {infoMessage ? (
            <View className="mb-3 rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-[13px] leading-5 text-muted">
                {infoMessage}
              </Text>
            </View>
          ) : null}

          <View className="gap-3">
            <Button size="lg" className="w-full" onPress={handleGoResult}>
              {t("paymentCheckout.checkStatus")}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onPress={handleRetryLoad}
            >
              {t("paymentCheckout.reloadPage")}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
