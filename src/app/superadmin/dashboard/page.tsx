'use client';

import React from 'react';
import SuperAdminDashboardView from '@/modules/super-admin/ui/SuperAdminDashboardView';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Role protection (Client-side)
  React.useEffect(() => {
    console.log('[SuperAdminDashboardPage] Checking access...', { user, isLoading });
    
    if (isLoading) return;

    if (!user) {
      console.log('[SuperAdminDashboardPage] No user found, redirecting to login');
      router.replace('/superadmin/login');
      return;
    }

    if (user.role !== 'Super Admin') {
      console.log('[SuperAdminDashboardPage] Invalid role:', user.role);
      router.replace('/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'Super Admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <SuperAdminDashboardView />
    </main>
  );
}
