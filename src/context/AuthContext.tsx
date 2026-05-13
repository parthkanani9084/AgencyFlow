'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthUser, UserRole } from '@/types';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS, STATIC_STRINGS } from '@/utils/constants';
import store from '@/utils/localstorage';
import { useLogin, useLogout, mapRole } from '@/api/hooks/useAuth';

import { getInitials } from '@/utils/helpers';




const DEMO_USERS: (AuthUser & { password: string })[] = [
  { id: 'u1', name: 'Alex Owens',    email: 'alex.owens@agencyflow.io',    password: 'Owner@2026',      role: ROLES.OWNER,       avatarInitials: 'AO' },
  { id: 'u2', name: 'Priya Sharma',  email: 'priya.sharma@agencyflow.io',  password: 'Manager@2026',    role: ROLES.MANAGER,     avatarInitials: 'PS' },
  { id: 'u3', name: 'Marco Reyes',   email: 'marco.reyes@agencyflow.io',   password: 'Shooter@2026',    role: ROLES.SHOOTER,     avatarInitials: 'MR' },
  { id: 'u4', name: 'Jin Park',      email: 'jin.park@agencyflow.io',      password: 'Editor@2026',     role: ROLES.EDITOR,      avatarInitials: 'JP' },
  { id: 'u5', name: 'Sofia Nguyen',  email: 'sofia.nguyen@agencyflow.io',  password: 'AdsManager@2026', role: ROLES.ADS_MANAGER, avatarInitials: 'SN' },
  { id: 'u6', name: 'Jordan Lee',    email: 'jordan.lee@novabrew.com',     password: 'Client@2026',     role: ROLES.CLIENT,      avatarInitials: 'JL' },
  { id: 'u7', name: 'Sam Rivera',    email: 'sam.rivera@agencyflow.io',    password: 'Social@2026',     role: ROLES.SOCIAL_MEDIA_MANAGER, avatarInitials: 'SR' },
];

// Role → default landing page
export const ROLE_HOME: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: ROUTES.SUPER_ADMIN_DASHBOARD,
  [ROLES.OWNER]:       ROUTES.OWNER_DASHBOARD,
  [ROLES.MANAGER]:     ROUTES.MANAGER_DASHBOARD,
  [ROLES.SHOOTER]:     ROUTES.SHOOTER_DASHBOARD,
  [ROLES.EDITOR]:      ROUTES.EDITOR_DASHBOARD,
  [ROLES.ADS_MANAGER]: ROUTES.ADS_MANAGER_DASHBOARD,
  [ROLES.SOCIAL_MEDIA_MANAGER]: ROUTES.SOCIAL_MEDIA_MANAGER_DASHBOARD,
  [ROLES.CLIENT]:      ROUTES.CLIENT_CAMPAIGNS,
};

// Pages accessible without login
const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.SUPER_ADMIN_LOGIN, ROUTES.SUPER_ADMIN_VERIFY];


interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setAuthenticatedUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}


const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { mutateAsync: loginApi, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logoutApi, isPending: isLoggingOut } = useLogout();


  // Rehydrate session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('af_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  // Route guard: redirect unauthenticated users to login
  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    
    // 1. Handle authenticated users on public pages
    if (user && isPublic) {
      
      // Super Admin specifically handles /superadmin/login
      if (user.role === ROLES.SUPER_ADMIN) {
        router.replace(ROLE_HOME[ROLES.SUPER_ADMIN]);
        return;
      }
      
      // Regular users handle other public pages
      if (!pathname.startsWith('/superadmin')) {
        router.replace(ROLE_HOME[user.role] || ROUTES.OWNER_DASHBOARD);
        return;
      }
    }

    // 2. Handle unauthenticated users on protected pages
    if (!user && !isPublic) {
      if (pathname.startsWith('/superadmin')) {
        router.replace(ROUTES.SUPER_ADMIN_LOGIN);
      } else {
        router.replace(ROUTES.LOGIN);
      }
    } 
    
    // 3. Handle unauthorized access to super-admin routes
    else if (user && pathname.startsWith('/superadmin') && user.role !== ROLES.SUPER_ADMIN && !isPublic) {
      router.replace(ROLE_HOME[user.role] || ROUTES.OWNER_DASHBOARD);
    }
  }, [user, isLoading, pathname, router]);

  const setAuthenticatedUser = useCallback((user: AuthUser) => {
    setUser(user);
    sessionStorage.setItem('af_user', JSON.stringify(user));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // 1. Try API login first
    try {
      const response = await loginApi({ email, password });

      if (response.success && response.results) {
        const { user: apiUser, accessToken, refreshToken } = response.results;
        const role = mapRole(apiUser.role);

        if (!role) {
          return { success: false, error: STATIC_STRINGS.LOGIN_ERR_UNAUTHORIZED_ROLE };
        }

        const authUser: AuthUser = {
          id: apiUser.id,
          name: apiUser.full_name,
          email: apiUser.email,
          role: role as UserRole,
          avatarInitials: getInitials(apiUser.full_name || ''),
        };

        setAuthenticatedUser(authUser);
        if (accessToken) store.setValue(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        if (refreshToken) store.setValue(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        return { success: true };
      }
    } catch (error: any) {
      console.warn('API Login failed, checking demo users...', error);
    }

    // 2. Fallback to demo users
    const matched = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!matched) return { success: false, error: 'Invalid credentials' };

    const { password: _pw, ...authUser } = matched;
    setUser(authUser);
    sessionStorage.setItem('af_user', JSON.stringify(authUser));
    
    store.setValue(STORAGE_KEYS.AUTH_TOKEN, `demo-access-token-${authUser.id}`);
    store.setValue(STORAGE_KEYS.REFRESH_TOKEN, `demo-refresh-token-${authUser.id}`);
    
    return { success: true };
  }, [loginApi, setAuthenticatedUser]);


  const logout = useCallback(async () => {
    try {
      const refreshToken = store.getValue(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await logoutApi({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
      setUser(null);
      sessionStorage.removeItem('af_user');
      store.removeValue(STORAGE_KEYS.AUTH_TOKEN);
      store.removeValue(STORAGE_KEYS.REFRESH_TOKEN);
      router.push(isSuperAdmin ? ROUTES.SUPER_ADMIN_LOGIN : ROUTES.LOGIN);
    }
  }, [router, user, logoutApi]);



  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      setAuthenticatedUser,
      isLoggingIn,
      isLoggingOut
    }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
