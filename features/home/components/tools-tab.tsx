import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ALL_SERVICES, QUICK_ACTIONS } from '@/features/home/constants/services';
import { ServicesGrid } from '@/features/home/components/services-grid';
import { ToolsHeroHeader } from '@/features/home/components/tools-hero-header';
import { Palette } from '@/constants/theme';

type ToolsTabProps = {
  isFarmer: boolean;
  t: (key: string) => string;
};

export function ToolsTab({ isFarmer, t }: ToolsTabProps) {
  const quickActions = QUICK_ACTIONS.filter((action) => !action.farmerOnly || isFarmer);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
      >
        <ToolsHeroHeader
          quickActionCount={quickActions.length}
          serviceCount={ALL_SERVICES.length}
          t={t}
        />

        {quickActions.length > 0 ? (
          <View className="mt-6 px-5">
            <Text className="mb-3 text-[18px] font-bold text-indigo">
              {t('home.tools.quickActions')}
            </Text>
            <View className="gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.key} action={action} t={t} />
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-6 px-5">
          <Text className="mb-3 text-[18px] font-bold text-indigo">
            {t('home.tools.allServices')}
          </Text>
          <ServicesGrid services={ALL_SERVICES} t={t} />
        </View>

        <View className="mt-5 px-5">
          <View
            className="flex-row items-center gap-3 rounded-2xl border border-border px-4 py-3.5"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Image
                source={require('@/assets/icons/ai.png')}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-bold text-indigo">
                {t('home.dashboard.aiInsightTitle')}
              </Text>
              <Text className="mt-0.5 text-[13px] leading-5 text-muted">
                {t('home.tools.comingSoonBody')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </View>

        <View className="mt-5 px-5">
          <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-5 py-8">
            <View
              className="mb-3 h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
            >
              <Ionicons name="sparkles-outline" size={20} color={Palette.indiaGreen} />
            </View>
            <Text className="text-center text-[15px] font-semibold text-indigo">
              {t('home.tools.comingSoon')}
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
              {t('home.tools.comingSoonBody')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.dashboard.askAi')}
        onPress={() => {}}
        className="absolute bottom-5 right-5 flex-row items-center gap-2 rounded-full bg-india-green px-5 py-3.5"
        style={{
          shadowColor: Palette.indiaGreen,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
        <Text className="text-[14px] font-bold text-white">{t('home.dashboard.askAi')}</Text>
      </Pressable>
    </View>
  );
}

function QuickActionCard({
  action,
  t,
}: {
  action: (typeof QUICK_ACTIONS)[number];
  t: (key: string) => string;
}) {
  return (
    <Pressable
      onPress={() => {
        if (action.href) {
          router.push(action.href);
        }
      }}
    >
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: action.iconBg }}
        >
          <Ionicons name={action.icon} size={22} color={action.iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-bold text-indigo">{t(action.titleKey)}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted" numberOfLines={2}>
            {t(action.badgeKey)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </Pressable>
  );
}
