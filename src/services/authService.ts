import { SUPER_ADMIN_CREDENTIALS, mockOTPs } from '@/mock-data/super-admin';
import { AuthUser } from '@/types';
import { ROLES } from '@/constants/roles';
import { STATIC_STRINGS } from '@/utils/constants';

export const authService = {
  async loginWithPassword(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (email === SUPER_ADMIN_CREDENTIALS.email && password === SUPER_ADMIN_CREDENTIALS.password) {
      const user: AuthUser = {
        id: 'sa1',
        name: 'Super Admin',
        email: email,
        role: ROLES.SUPER_ADMIN,
        avatarInitials: 'SA',
      };
      return { success: true, user };
    }
    return { success: false, error: STATIC_STRINGS.LOGIN_INVALID_CREDENTIALS };
  },

  async requestOTP(email: string): Promise<{ success: boolean; error?: string }> {
    if (email !== SUPER_ADMIN_CREDENTIALS.email) {
      return { success: false, error: 'Email not found' };
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mockOTPs[email] = otp;
    return { success: true };
  },

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const isHardcodedValid = email === SUPER_ADMIN_CREDENTIALS.email && otp === '123456';
    
    if (isHardcodedValid || (mockOTPs[email] && mockOTPs[email] === otp)) {
      if (mockOTPs[email]) delete mockOTPs[email];
      const user: AuthUser = {
        id: 'sa1',
        name: 'Super Admin',
        email: email,
        role: ROLES.SUPER_ADMIN,
        avatarInitials: 'SA',
      };
      return { success: true, user };
    }
    return { success: false, error: STATIC_STRINGS.LOGIN_INVALID_OTP };
  }
};
