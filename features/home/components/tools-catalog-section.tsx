import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { FeaturedServiceCard } from '@/features/home/components/featured-service-card';
import { ServicesGrid } from '@/features/home/components/services-grid';
import { useCatalog } from '@/features/home/hooks/use-catalog';
import {
  partitionCatalogServices,
  sortFeaturedServices,
  toGridService,
} from '@/features/home/utils/catalog-display';
import { Palette } from '@/constants/theme';
import type { AppIconName } from '@/components/ui/app-icon';

type ToolsCatalogSectionProps = {
  t: (key: string) => string;
  onCountsChange?: (counts: { bookable: number; total: number }) => void;
};

function SectionHeader({ icon, title, subtitle }: { icon: AppIconName; title: string; subtitle?: string }) {
  return (
    <View className="mb-3 px-5">
      <View className="min-w-0 flex-row items-start gap-2.5">
        <View
          className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
        >
          <AppIcon name={icon} size={18} color={Palette.indiaGreen} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[18px] font-bold leading-6 text-indigo">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-[13px] leading-5 text-muted">{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ToolsCatalogSection({ t, onCountsChange }: ToolsCatalogSectionProps) {
  const { data: catalogServices, isLoading } = useCatalog();
  const services = catalogServices ?? [];

  const { bookable, comingSoon } = useMemo(
    () => partitionCatalogServices(services),
    [services],
  );
  const featuredServices = useMemo(() => sortFeaturedServices(bookable), [bookable]);
  const bookableGrid = useMemo(() => bookable.map((service) => toGridService(service, t)), [bookable, t]);
  const comingSoonGrid = useMemo(
    () => comingSoon.map((service) => toGridService(service, t)),
    [comingSoon, t],
  );

  useEffect(() => {
    if (!isLoading) {
      onCountsChange?.({ bookable: bookable.length, total: services.length });
    }
  }, [bookable.length, isLoading, onCountsChange, services.length]);

  if (isLoading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      </View>
    );
  }

  if (!services.length) {
    return null;
  }

  return (
    <>
      {featuredServices.length > 0 ? (
        <View className="mt-6">
          <SectionHeader
            icon="star-four-points-outline"
            title={t('home.tools.featured')}
            subtitle={t('home.tools.bookServicesBody')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="items-start px-5"
          >
            {featuredServices.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} t={t} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {bookableGrid.length > 0 ? (
        <View className="mt-6">
          <SectionHeader icon="check-decagram-outline" title={t('home.tools.bookServices')} />
          <View className="px-5">
            <ServicesGrid services={bookableGrid} t={t} />
          </View>
        </View>
      ) : null}

      {comingSoonGrid.length > 0 ? (
        <View className="mt-6">
          <SectionHeader
            icon="clock-outline"
            title={t('home.tools.comingSoon')}
            subtitle={t('home.tools.comingSoonBody')}
          />
          <View className="px-5">
            <ServicesGrid services={comingSoonGrid} t={t} />
          </View>
        </View>
      ) : null}
    </>
  );
}
