import { UserRole } from '@/types';

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Owner',
  MANAGER: 'Manager',
  SHOOTER: 'Shooter',
  EDITOR: 'Editor',
  ADS_MANAGER: 'Ads Manager',
  SOCIAL_MEDIA_MANAGER: 'Social Media Manager',
  CLIENT: 'Client',
} as const;

export const ROLE_LIST = Object.values(ROLES);
