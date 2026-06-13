import type { GeoPolygon } from '@/types/farmer';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export function computeAreaAcres(coords: LatLng[]): number {
  if (coords.length < 3) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const avgLat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length;
  const mPerLat = 111_320;
  const mPerLon = 111_320 * Math.cos(toRad(avgLat));
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area +=
      coords[i].longitude * mPerLon * (coords[j].latitude * mPerLat) -
      coords[j].longitude * mPerLon * (coords[i].latitude * mPerLat);
  }
  return Math.abs(area) / 2 / 4_047;
}

export function toGeoJsonPolygon(coords: LatLng[]): GeoPolygon {
  const ring = coords.map((c): [number, number] => [c.longitude, c.latitude]);
  ring.push([coords[0].longitude, coords[0].latitude]);
  return { type: 'Polygon', coordinates: [ring] };
}

export function fromGeoJsonPolygon(geometry: GeoPolygon): LatLng[] {
  const ring = geometry.coordinates[0];
  if (!ring || ring.length < 4) return [];
  return ring.slice(0, -1).map(([longitude, latitude]) => ({ latitude, longitude }));
}

export function regionFromCoords(coords: LatLng[], padding = 0.002) {
  if (coords.length === 0) return null;
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding, 0.003),
    longitudeDelta: Math.max(maxLon - minLon + padding, 0.003),
  };
}
