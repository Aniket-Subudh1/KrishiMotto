import { Redirect, Tabs } from "expo-router";

import { AuthRedirect } from "@/components/auth/auth-redirect";
import { AppTabBar } from "@/components/navigation/app-tab-bar";
import { Colors } from "@/constants/theme";
import { FarmerHomeProvider } from "@/features/home/context/farmer-home-context";
import { ExpertHomeProvider } from "@/features/expert/context/expert-home-context";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthStore } from "@/stores/auth.store";

export default function TabLayout() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const isFarmer = user?.role === "FARMER";
  const isExpert = user?.role === "EXPERT";

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (!profileCompleted) {
    return <AuthRedirect />;
  }

  const content = (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.tabs.home"),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t("expertDashboard.tabs.requests"),
          href: isExpert ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("expertDashboard.tabs.orders"),
          href: isExpert ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="land"
        options={{
          title: t("home.tabs.land"),
          href: isFarmer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("home.tabs.tools"),
          href: isFarmer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("home.tabs.profile"),
          href: isFarmer || isExpert ? undefined : null,
        }}
      />
    </Tabs>
  );

  if (isFarmer) {
    return <FarmerHomeProvider>{content}</FarmerHomeProvider>;
  }

  if (isExpert) {
    return <ExpertHomeProvider>{content}</ExpertHomeProvider>;
  }

  return content;
}
