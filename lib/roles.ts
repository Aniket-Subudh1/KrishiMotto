import type { SelectableRole } from '@/constants/roles';
import type { BackendUserRole } from '@/types/auth';

export function toSelectableRole(role: BackendUserRole): SelectableRole | null {
  if (role === 'FARMER') return 'farmer';
  if (role === 'EXPERT') return 'expert';
  return null;
}

export function toBackendUserRole(role: SelectableRole): 'FARMER' | 'EXPERT' {
  return role === 'farmer' ? 'FARMER' : 'EXPERT';
}
