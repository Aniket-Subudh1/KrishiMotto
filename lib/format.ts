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

/** Human-readable expert application reference for pending / support use. */
export function formatExpertApplicationRef(
  userId: string,
  phone?: string | null,
): string {
  const normalizedPhone = phone?.replace(/\D/g, '').slice(-10);
  if (normalizedPhone?.length === 10) {
    return `KM-${normalizedPhone.slice(0, 5)}-${normalizedPhone.slice(5)}`;
  }

  const objectId = userId.trim();
  if (/^[a-f0-9]{24}$/i.test(objectId)) {
    const timestamp = Number.parseInt(objectId.slice(0, 8), 16);
    const serial = Number.parseInt(objectId.slice(18, 24), 16) % 10000;
    const date = new Date(timestamp * 1000);
    const yymmdd = [
      date.getFullYear().toString().slice(-2),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('');
    return `KM-${yymmdd}-${serial.toString().padStart(4, '0')}`;
  }

  const fallback = Number.parseInt(objectId.replace(/\D/g, '').slice(-7), 10) || 0;
  return `KM-${fallback.toString().padStart(7, '0')}`;
}
