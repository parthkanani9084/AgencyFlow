import { UserRole } from '@/types';
import { ROLES } from '@/constants/roles';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.OWNER]: 80,
  [ROLES.MANAGER]: 60,
  [ROLES.ADS_MANAGER]: 40,
  [ROLES.SOCIAL_MEDIA_MANAGER]: 40,
  [ROLES.EDITOR]: 20,
  [ROLES.SHOOTER]: 20,
  [ROLES.CLIENT]: 0,
};

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
