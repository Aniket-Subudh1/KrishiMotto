import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Text } from "@/components/ui/text";
import { AppBarGradient, Palette } from "@/constants/theme";
import { ExpertOrderCard } from "@/features/expert/components/expert-order-card";
import {
  ExpertMarketplaceEmpty,
  ExpertMarketplaceInlineNotice,
  ExpertMarketplaceSectionLoading,
} from "@/features/expert/components/expert-marketplace-states";
import { useExpertHome, useExpertPollingScope } from "@/features/expert/context/expert-home-context";
import { FarmerHeaderActions } from "@/features/home/components/farmer-header-actions";
import { getExpertMarketplaceError } from "@/features/expert/hooks/use-expert-orders";
import { useAppLocale } from "@/hooks/use-app-locale";

type ExpertOverviewTabProps = {
  greeting: string;
};

function SectionHeader({
  title,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon: AppIconName;
}) {
  return (
    <View className="mb-4 flex-row items-start justify-between gap-2">
      <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
        <View
          className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(70, 150, 47, 0.1)" }}
        >
          <AppIcon name={icon} size={18} color={Palette.indiaGreen} />
        </View>
        <Text className="shrink text-[18px] font-bold leading-6 text-indigo">
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="shrink-0 flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(70, 150, 47, 0.08)" }}
        >
          <Text className="text-[13px] font-semibold text-india-green">
            {actionLabel}
          </Text>
          <AppIcon name="arrow-right" size={14} color={Palette.indiaGreen} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ExpertOverviewTab({ greeting }: ExpertOverviewTabProps) {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  useExpertPollingScope('overview');
  const {
    profile,
    profileLoading,
    canLoadRequests,
    isRefreshing,
    onRefresh,
    openRequestCount,
    activeOrderCount,
    unreadNotificationCount,
    hasMoreRequests,
    hasMoreOrders,
    requestPreview,
    orderPreview,
    requestsLoading,
    ordersLoading,
    requestsError,
    ordersError,
    refetchRequests,
    refetchOrders,
  } = useExpertHome();

  const displayName = profile?.name ?? t("home.profile.expert");
  const serviceAreas = profile?.serviceDistricts?.length
    ? profile.serviceDistricts.join(", ")
    : t("expertDashboard.hero.serviceAreasFallback");
  const requestsErrorContent = requestsError
    ? getExpertMarketplaceError(requestsError, t)
    : null;
  const ordersErrorContent = ordersError ? getExpertMarketplaceError(ordersError, t) : null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={[...AppBarGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 28,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="min-w-0 flex-1 pr-3">
              <Text className="text-[13px] font-medium uppercase tracking-wider text-white/75">
                {greeting}
              </Text>
              <Text className="mt-0.5 text-[24px] font-bold leading-8 text-white">
                {displayName.split(" ")[0]}
              </Text>
              <View className="mt-2 flex-row items-center gap-1.5">
                <AppIcon
                  name="map-marker-outline"
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
                <Text
                  className="flex-1 text-[13px] leading-5 text-white/85"
                  numberOfLines={2}
                >
                  {serviceAreas}
                </Text>
              </View>
              {profile?.verifiedBadge ? (
                <View className="mt-3 self-start flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                  <AppIcon name="check-decagram" size={14} color="#FFFFFF" />
                  <Text className="text-[12px] font-semibold text-white">
                    {t("expertDashboard.hero.verified")}
                  </Text>
                </View>
              ) : null}
            </View>

            <FarmerHeaderActions>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("home.dashboard.notifications")}
                onPress={() => router.push("/expert-notifications" as Href)}
                className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
                style={{
                  shadowColor: Palette.indigo,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <AppIcon name="bell-outline" size={22} color={Palette.indigo} />
                {unreadNotificationCount > 0 ? (
                  <View className="absolute -right-1 -top-1 min-h-5 min-w-5 items-center justify-center rounded-full bg-marigold px-1">
                    <Text className="text-[10px] font-bold text-indigo">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </FarmerHeaderActions>
          </View>

          <View className="mt-6 flex-row gap-3">
            <StatTile
              label={t("expertDashboard.hero.openRequestsLabel")}
              value={profileLoading || !canLoadRequests ? "—" : String(openRequestCount)}
              hint={hasMoreRequests ? "+" : ""}
            />
            <StatTile
              label={t("expertDashboard.hero.activeOrdersLabel")}
              value={ordersLoading && !orderPreview.length ? "—" : String(activeOrderCount)}
              hint={hasMoreOrders ? "+" : ""}
            />
          </View>
        </LinearGradient>

        <View className="mt-7 px-5">
          <SectionHeader
            icon="briefcase-search-outline"
            title={t("expertDashboard.openRequests.title")}
            actionLabel={t("home.overview.viewAll")}
            onAction={() => router.push("/(tabs)/requests" as Href)}
          />
          {profileLoading ? (
            <ExpertMarketplaceSectionLoading />
          ) : !canLoadRequests ? (
            <ExpertMarketplaceInlineNotice
              icon="shield-alert-outline"
              title={t("expertDashboard.errors.verificationRequiredTitle")}
              message={t("expertDashboard.errors.verificationRequiredBody")}
              actionLabel={t("expertDashboard.errors.viewProfile")}
              onAction={() => router.push("/(tabs)/profile" as Href)}
            />
          ) : requestsLoading ? (
            <ExpertMarketplaceSectionLoading />
          ) : requestsErrorContent ? (
            <ExpertMarketplaceInlineNotice
              icon="cloud-alert-outline"
              iconColor="#EF4444"
              iconBg="rgba(239, 68, 68, 0.08)"
              title={requestsErrorContent.title}
              message={requestsErrorContent.message}
              actionLabel={t("expertDashboard.retry")}
              onAction={refetchRequests}
            />
          ) : requestPreview.length === 0 ? (
            <ExpertMarketplaceEmpty
              icon="briefcase-search-outline"
              title={t("expertDashboard.openRequests.empty")}
              message={t("expertDashboard.openRequests.emptyHint")}
            />
          ) : (
            <View className="gap-3">
              {requestPreview.map((booking) => (
                <ExpertOrderCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  variant="request"
                />
              ))}
            </View>
          )}
        </View>

        <View className="mt-8 px-5">
          <SectionHeader
            icon="clipboard-list-outline"
            title={t("expertDashboard.myOrders.title")}
            actionLabel={t("home.overview.viewAll")}
            onAction={() => router.push("/(tabs)/orders" as Href)}
          />
          {ordersLoading ? (
            <ExpertMarketplaceSectionLoading />
          ) : ordersErrorContent ? (
            <ExpertMarketplaceInlineNotice
              icon="cloud-alert-outline"
              iconColor="#EF4444"
              iconBg="rgba(239, 68, 68, 0.08)"
              title={ordersErrorContent.title}
              message={ordersErrorContent.message}
              actionLabel={t("expertDashboard.retry")}
              onAction={refetchOrders}
            />
          ) : orderPreview.length === 0 ? (
            <ExpertMarketplaceEmpty
              icon="clipboard-list-outline"
              title={t("expertDashboard.myOrders.empty")}
              message={t("expertDashboard.myOrders.emptyHint")}
            />
          ) : (
            <View className="gap-3">
              {orderPreview.map((booking) => (
                <ExpertOrderCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  locale={locale}
                  variant="order"
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View className="min-w-0 flex-1 rounded-2xl bg-white/15 px-4 py-3">
      <Text className="text-[11px] font-medium uppercase tracking-wide text-white/75">
        {label}
      </Text>
      <Text className="mt-1 text-[22px] font-bold text-white">
        {value}
        {hint}
      </Text>
    </View>
  );
}
