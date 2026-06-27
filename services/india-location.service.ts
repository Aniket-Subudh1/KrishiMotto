import { buildIndiaLocationDirectory } from '@/lib/india-location';
import type { IndiaLocationDirectory, PincodeLookupResponse } from '@/types/india-location';

const DISTRICTS_URL =
  'https://raw.githubusercontent.com/iaseth/data-for-india/master/data/readable/districts.json';
const PINCODE_URL = 'https://api.postalpincode.in/pincode';

type DistrictRow = {
  state: string;
  district: string;
};

type DistrictDataset = {
  districts: DistrictRow[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export const indiaLocationService = {
  async getStatesAndDistricts(): Promise<IndiaLocationDirectory> {
    const data = await fetchJson<DistrictDataset>(DISTRICTS_URL);
    return buildIndiaLocationDirectory(data.districts);
  },

  async lookupPincodeResponse(pincode: string): Promise<PincodeLookupResponse | null> {
    const payload = await fetchJson<PincodeLookupResponse[]>(`${PINCODE_URL}/${pincode}`);
    const result = payload[0];

    if (!result || result.Status !== 'Success' || !result.PostOffice?.length) {
      return null;
    }

    return result;
  },
};
