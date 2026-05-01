import { authService } from '@/services/authService';

export const authAgent = {
  async processAction(action: 'login' | 'request_otp' | 'verify_otp', payload: any) {
    console.log(`[AuthAgent] Processing action: ${action}`, payload);

    switch (action) {
      case 'login':
        if (!payload.email || !payload.password) {
          return { success: false, error: 'Email and password are required' };
        }
        return await authService.loginWithPassword(payload.email, payload.password);

      case 'request_otp':
        if (!payload.email) {
          return { success: false, error: 'Email is required' };
        }
        return await authService.requestOTP(payload.email);

      case 'verify_otp':
        if (!payload.email || !payload.otp) {
          return { success: false, error: 'Email and OTP are required' };
        }
        return await authService.verifyOTP(payload.email, payload.otp);

      default:
        return { success: false, error: 'Unknown action' };
    }
  }
};
