import { UserRole } from '@/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Super Admin': 100,
  'Owner': 80,
  'Manager': 60,
  'Ads Manager': 40,
  'Social Media Manager': 40,
  'Editor': 20,
  'Shooter': 20,
  'Client': 0,
};

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
