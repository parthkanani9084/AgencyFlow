'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthUser, UserRole } from '@/lib/types';

// ─── Demo credentials (mirrors LoginForm) ─────────────────────────────────────
const DEMO_USERS: (AuthUser & { password: string })[] = [
  { id: 'u1', name: 'Alex Owens',    email: 'alex.owens@agencyflow.io',    password: 'Owner@2026',      role: 'Owner',       avatarInitials: 'AO' },
  { id: 'u2', name: 'Priya Sharma',  email: 'priya.sharma@agencyflow.io',  password: 'Manager@2026',    role: 'Manager',     avatarInitials: 'PS' },
  { id: 'u3', name: 'Marco Reyes',   email: 'marco.reyes@agencyflow.io',   password: 'Shooter@2026',    role: 'Shooter',     avatarInitials: 'MR' },
  { id: 'u4', name: 'Jin Park',      email: 'jin.park@agencyflow.io',      password: 'Editor@2026',     role: 'Editor',      avatarInitials: 'JP' },
  { id: 'u5', name: 'Sofia Nguyen',  email: 'sofia.nguyen@agencyflow.io',  password: 'AdsManager@2026', role: 'Ads Manager', avatarInitials: 'SN' },
];

// Role → default landing page
export const ROLE_HOME: Record<UserRole, string> = {
  Owner:       '/dashboard',
  Manager:     '/manager-dashboard',
  Shooter:     '/shooter-dashboard',
  Editor:      '/editor-dashboard',
  'Ads Manager': '/ads-manager-dashboard',
};

// Pages accessible without login
const PUBLIC_PATHS = ['/sign-up-login-screen'];

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
    if (!user && !isPublic) {
      router.replace('/sign-up-login-screen');
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

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('af_user');
    router.push('/sign-up-login-screen');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
