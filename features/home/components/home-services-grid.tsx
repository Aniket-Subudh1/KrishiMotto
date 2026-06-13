import { ALL_SERVICES } from '@/features/home/constants/services';

import { ServicesGrid } from './services-grid';

type HomeServicesGridProps = {
  t: (key: string) => string;
};

export function HomeServicesGrid({ t }: HomeServicesGridProps) {
  return <ServicesGrid services={ALL_SERVICES} t={t} />;
}
