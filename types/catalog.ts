/** Mirrors backend `SERVICE_ICON_TYPES` — each value maps to a bundled icon in the farmer app. */
export const SERVICE_ICON_TYPES = [
  'CROP_CALENDAR',
  'DRONE_SPRAY',
  'CROP_HEALTH',
  'SOIL_HEALTH',
  'EXPERT_VISIT',
  'PPACS_CREDIT',
  'STORAGE',
  'CROP_TRACKER',
  'IRRIGATION',
  'FERTILIZER',
  'PEST_CONTROL',
  'WEATHER',
  'SEEDS',
  'HARVEST',
  'INSURANCE',
  'MARKET',
] as const;

export type ServiceIconType = (typeof SERVICE_ICON_TYPES)[number];

export type CatalogService = {
  id: string;
  title: string;
  description?: string;
  iconType: ServiceIconType;
  priceLabel: string;
  pricingStrategy: string;
  basePricePaise: number;
  transportApplies: boolean;
  sortOrder: number;
};
