import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

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

type ToolsCatalogSectionProps = {
  t: (key: string) => string;
  onCountsChange?: (counts: { bookable: number; total: number }) => void;
};

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
          <View className="mb-3 px-5">
            <Text className="text-[18px] font-bold text-indigo">{t('home.tools.featured')}</Text>
            <Text className="mt-1 text-[13px] leading-5 text-muted">
              {t('home.tools.bookServicesBody')}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5"
          >
            {featuredServices.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} t={t} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {bookableGrid.length > 0 ? (
        <View className="mt-6 px-5">
          <Text className="mb-3 text-[18px] font-bold text-indigo">
            {t('home.tools.bookServices')}
          </Text>
          <ServicesGrid services={bookableGrid} t={t} />
        </View>
      ) : null}

      {comingSoonGrid.length > 0 ? (
        <View className="mt-6 px-5">
          <Text className="mb-1 text-[18px] font-bold text-indigo">{t('home.tools.comingSoon')}</Text>
          <Text className="mb-3 text-[13px] leading-5 text-muted">
            {t('home.tools.comingSoonBody')}
          </Text>
          <ServicesGrid services={comingSoonGrid} t={t} />
        </View>
      ) : null}
    </>
  );
}
