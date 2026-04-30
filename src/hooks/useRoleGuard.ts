'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/context/AuthContext';
import type { UserRole } from '@/types';

/**
 * Redirects the user away from the current page if their role is not in allowedRoles.
 * Unauthenticated users are sent to the login page (handled by AuthContext global guard).
 * Authenticated users with wrong role are sent to their role's home page.
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return; // global guard in AuthContext handles redirect to login
    if (!allowedRoles.includes(user.role)) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [user, isLoading, allowedRoles, router]);
}
