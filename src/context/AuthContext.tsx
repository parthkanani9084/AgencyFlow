'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthUser, UserRole } from '@/types';

// ─── Demo credentials (mirrors LoginForm) ─────────────────────────────────────
const DEMO_USERS: (AuthUser & { password: string })[] = [
  { id: 'u1', name: 'Alex Owens',    email: 'alex.owens@agencyflow.io',    password: 'Owner@2026',      role: 'Owner',       avatarInitials: 'AO' },
  { id: 'u2', name: 'Priya Sharma',  email: 'priya.sharma@agencyflow.io',  password: 'Manager@2026',    role: 'Manager',     avatarInitials: 'PS' },
  { id: 'u3', name: 'Marco Reyes',   email: 'marco.reyes@agencyflow.io',   password: 'Shooter@2026',    role: 'Shooter',     avatarInitials: 'MR' },
  { id: 'u4', name: 'Jin Park',      email: 'jin.park@agencyflow.io',      password: 'Editor@2026',     role: 'Editor',      avatarInitials: 'JP' },
  { id: 'u5', name: 'Sofia Nguyen',  email: 'sofia.nguyen@agencyflow.io',  password: 'AdsManager@2026', role: 'Ads Manager', avatarInitials: 'SN' },
  { id: 'u6', name: 'Jordan Lee',    email: 'jordan.lee@novabrew.com',     password: 'Client@2026',     role: 'Client',      avatarInitials: 'JL' },
  { id: 'u7', name: 'Sam Rivera',    email: 'sam.rivera@agencyflow.io',    password: 'Social@2026',     role: 'Social Media Manager', avatarInitials: 'SR' },
];

// Role → default landing page
export const ROLE_HOME: Record<UserRole, string> = {
  'Super Admin': '/superadmin/dashboard',
  Owner:       '/dashboard',
  Manager:     '/manager-dashboard',
  Shooter:     '/shooter-dashboard',
  Editor:      '/editor-dashboard',
  'Ads Manager': '/ads-manager-dashboard',
  'Social Media Manager': '/social-media-manager-dashboard',
  Client:      '/client/campaigns',
};

// Pages accessible without login
const PUBLIC_PATHS = ['/sign-up-login-screen', '/superadmin/login', '/superadmin/verify'];

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setAuthenticatedUser: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      console.log('[AuthGuard] Authenticated user on public page:', { role: user.role, pathname });
      
      // Super Admin specifically handles /superadmin/login
      if (user.role === 'Super Admin') {
        router.replace(ROLE_HOME['Super Admin']);
        return;
      }
      
      // Regular users handle other public pages
      if (user.role !== 'Super Admin' && !pathname.startsWith('/superadmin')) {
        router.replace(ROLE_HOME[user.role] || '/dashboard');
        return;
      }
    }

    // 2. Handle unauthenticated users on protected pages
    if (!user && !isPublic) {
      console.log('[AuthGuard] Unauthenticated user on protected page:', pathname);
      if (pathname.startsWith('/superadmin')) {
        router.replace('/superadmin/login');
      } else {
        router.replace('/sign-up-login-screen');
      }
    } 
    
    // 3. Handle unauthorized access to super-admin routes
    else if (user && pathname.startsWith('/superadmin') && user.role !== 'Super Admin' && !isPublic) {
      console.log('[AuthGuard] Unauthorized access attempt:', { role: user.role, pathname });
      router.replace(ROLE_HOME[user.role] || '/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    // BACKEND INTEGRATION: POST /api/auth/login → { token, user }
    const matched = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!matched) return { success: false, error: 'Invalid credentials — use the demo accounts below to sign in' };

    const { password: _pw, ...authUser } = matched;
    setUser(authUser);
    sessionStorage.setItem('af_user', JSON.stringify(authUser));
    return { success: true };
  }, []);

  const setAuthenticatedUser = useCallback((user: AuthUser) => {
    setUser(user);
    sessionStorage.setItem('af_user', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    const isSuperAdmin = user?.role === 'Super Admin';
    setUser(null);
    sessionStorage.removeItem('af_user');
    router.push(isSuperAdmin ? '/superadmin/login' : '/sign-up-login-screen');
  }, [router, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setAuthenticatedUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
