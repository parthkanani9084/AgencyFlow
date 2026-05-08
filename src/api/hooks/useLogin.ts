import { useMutation } from '@tanstack/react-query';
import { authService, LoginPayload } from '../services/auth.service';
import { UserRole } from '@/types';
import { ROLES } from '@/constants/roles';

export const mapRole = (apiRole: string): UserRole | null => {
  if (!apiRole) return null;
  
  const normalizedInput = apiRole.toLowerCase().replace(/[-\s]/g, '_');
  
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
  return roleMap[normalizedInput] || null;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });
};
