import type { FarmerExpertSummary } from '@/types/expert';

export function looksLikeOpaqueId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
  ) {
    return true;
  }

  if (/^[0-9a-f]{24}$/i.test(trimmed)) {
    return true;
  }

  if (/^[0-9a-f-]{32,}$/i.test(trimmed)) {
    return true;
  }

  return false;
}

export function getExpertDisplayName(expert?: FarmerExpertSummary | null): string | undefined {
  const name = expert?.name?.trim();
  if (!name || looksLikeOpaqueId(name)) {
    return undefined;
  }

  return name;
}

export function expertInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
