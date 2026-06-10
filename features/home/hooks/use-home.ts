// Home feature hooks — expand as the backend adds dashboard/feed endpoints.

export const HOME_KEYS = {
  feed: ['home', 'feed'] as const,
  weather: (lat: number, lon: number) => ['home', 'weather', lat, lon] as const,
};
