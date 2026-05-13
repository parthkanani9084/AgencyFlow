import { useMutation } from '@tanstack/react-query';
import { authService, RefreshTokenPayload } from '../services/auth.service';

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (payload: RefreshTokenPayload) => authService.refreshToken(payload),
  });
};
