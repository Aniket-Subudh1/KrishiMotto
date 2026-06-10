// Explore feature hooks — expand as map/geo endpoints are added.

export const EXPLORE_KEYS = {
  crops: (region: string) => ['explore', 'crops', region] as const,
  experts: (lat: number, lon: number) => ['explore', 'experts', lat, lon] as const,
};
