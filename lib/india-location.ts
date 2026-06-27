import type { IndiaLocationDirectory, PincodePostOffice } from '@/types/india-location';

const STATE_ALIASES: Record<string, string> = {
  delhi: 'National Capital Territory of Delhi',
  'nct of delhi': 'National Capital Territory of Delhi',
  'national capital territory of delhi': 'National Capital Territory of Delhi',
  orissa: 'Odisha',
  pondicherry: 'Puducherry',
  'jammu & kashmir': 'Jammu and Kashmir',
  'jammu and kashmir': 'Jammu and Kashmir',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'andaman and nicobar islands': 'Andaman and Nicobar',
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveStateName(rawState: string, directory: IndiaLocationDirectory): string | null {
  const normalized = normalizeKey(rawState);
  const alias = STATE_ALIASES[normalized];

  for (const entry of directory.states) {
    const stateKey = normalizeKey(entry.state);
    if (stateKey === normalized || (alias && stateKey === normalizeKey(alias))) {
      return entry.state;
    }
  }

  if (alias) {
    for (const entry of directory.states) {
      if (normalizeKey(entry.state) === normalizeKey(alias)) {
        return entry.state;
      }
    }
  }

  return null;
}

export function resolveDistrictName(
  rawDistrict: string,
  stateName: string,
  directory: IndiaLocationDirectory,
): string | null {
  const stateEntry = directory.states.find((entry) => entry.state === stateName);
  if (!stateEntry) {
    return null;
  }

  const normalized = normalizeKey(rawDistrict);
  const exact = stateEntry.districts.find((district) => normalizeKey(district) === normalized);
  if (exact) {
    return exact;
  }

  const contains = stateEntry.districts.find((district) => {
    const districtKey = normalizeKey(district);
    return districtKey.includes(normalized) || normalized.includes(districtKey);
  });

  return contains ?? null;
}

export function resolveLocationFromPostOffices(
  postOffices: PincodePostOffice[],
  directory: IndiaLocationDirectory,
): { state: string; district: string } | null {
  for (const office of postOffices) {
    const state = resolveStateName(office.State, directory);
    if (!state) {
      continue;
    }

    const district = resolveDistrictName(office.District, state, directory);
    if (district) {
      return { state, district };
    }
  }

  return null;
}

export function buildIndiaLocationDirectory(
  rows: readonly { state: string; district: string }[],
): IndiaLocationDirectory {
  const byState = new Map<string, Set<string>>();

  for (const row of rows) {
    const state = row.state.trim();
    const district = row.district.trim();
    if (!state || !district) {
      continue;
    }

    const districts = byState.get(state) ?? new Set<string>();
    districts.add(district);
    byState.set(state, districts);
  }

  const states = [...byState.entries()]
    .map(([state, districts]) => ({
      state,
      districts: [...districts].sort((a, b) => a.localeCompare(b, 'en-IN')),
    }))
    .sort((a, b) => a.state.localeCompare(b.state, 'en-IN'));

  return { states };
}
