import { ActivityIndicator, View } from 'react-native';

import { useCatalog } from '@/features/home/hooks/use-catalog';
import { toGridService } from '@/features/home/utils/catalog-display';
import { Palette } from '@/constants/theme';

import { ServicesGrid } from './services-grid';

type HomeServicesGridProps = {
  t: (key: string) => string;
};

export function HomeServicesGrid({ t }: HomeServicesGridProps) {
  const { data: catalogServices, isLoading } = useCatalog();

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      </View>
    );
  }

  if (!catalogServices?.length) {
    return null;
  }

  const services = catalogServices.map((service) => toGridService(service, t));

  return <ServicesGrid services={services} t={t} />;
}
