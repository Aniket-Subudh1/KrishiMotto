import type { Href } from 'expo-router';

import { Palette } from '@/constants/theme';
import type { FarmerSmartContract, SmartContractStatus } from '@/types/credit';

export const SMART_CONTRACTS_ROUTE = '/services/smart-contracts' as Href;

export function getSmartContractDetailRoute(id: string): Href {
  return `/services/smart-contracts/${id}` as Href;
}

export function findSmartContractByStorageRequest(
  contracts: FarmerSmartContract[],
  storageRequestId: string,
): FarmerSmartContract | undefined {
  return contracts.find((contract) => contract.storageRequestId === storageRequestId);
}

export function isPledgeableContract(contract: FarmerSmartContract): boolean {
  return (
    contract.freeQuantityKg > 0 &&
    contract.status !== 'FULLY_PLEDGED' &&
    contract.status !== 'RELEASED'
  );
}

export function getSmartContractStatusColor(status: SmartContractStatus): string {
  switch (status) {
    case 'ACTIVE':
      return Palette.indiaGreen;
    case 'PARTIALLY_PLEDGED':
      return '#F59E0B';
    case 'FULLY_PLEDGED':
      return Palette.indigo;
    case 'RELEASED':
      return '#94A3B8';
    default:
      return Palette.indigo;
  }
}

export function translateSmartContractStatus(
  t: (key: string) => string,
  status: SmartContractStatus,
): string {
  return t(`smartContracts.statuses.${status}`);
}

export function translateEventType(t: (key: string) => string, type: string): string {
  const key = `smartContracts.eventTypes.${type}`;
  const translated = t(key);
  return translated === key ? type.replace(/_/g, ' ') : translated;
}
