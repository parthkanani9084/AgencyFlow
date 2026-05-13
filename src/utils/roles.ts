import { ROLES } from '@/constants/roles';
import { UserRole } from '@/types';

export const normalizeRole = (apiRole: string): UserRole => {
  if (!apiRole) return ROLES.SHOOTER as UserRole;
  const key = apiRole.toLowerCase().replace(/[-\s]/g, '_');
  const roleMap: Record<string, UserRole> = {
    owner: ROLES.OWNER,
    manager: ROLES.MANAGER,
    shooter: ROLES.SHOOTER,
    editor: ROLES.EDITOR,
    ads_manager: ROLES.ADS_MANAGER,
    social_media_manager: ROLES.SOCIAL_MEDIA_MANAGER,
    client: ROLES.CLIENT,
    super_admin: ROLES.SUPER_ADMIN,
  };
  return roleMap[key] || apiRole as UserRole;
};

export const toApiRole = (role: string): string => {
  return role.toLowerCase().replace(/\s+/g, '-');
};
