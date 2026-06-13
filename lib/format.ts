export function formatAcres(acres: number): string {
  if (acres < 0.01) return '< 0.01 ac';
  if (acres >= 1000) return `${(acres / 1000).toFixed(1)}k ac`;
  return `${acres.toFixed(2)} ac`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
