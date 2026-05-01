import { UserRole } from '@/types';

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
  SHOOTER: 'Shooter',
  EDITOR: 'Editor',
  ADS_MANAGER: 'Ads Manager',
  SOCIAL_MEDIA_MANAGER: 'Social Media Manager',
  CLIENT: 'Client',
};

export const ROLE_LIST = Object.values(ROLES);
