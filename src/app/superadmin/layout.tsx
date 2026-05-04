'use client';

import { SuperAdminProvider } from '@/store/superAdminStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLES } from '@/constants/roles';
import { Loader2 } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isLoginPage = pathname === '/superadmin/login';

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user && !isLoginPage) {
        router.replace('/superadmin/login');
      } else if (user && user.role !== ROLES.SUPER_ADMIN && !isLoginPage) {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router, mounted, isLoginPage]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!isLoginPage && (!user || user.role !== ROLES.SUPER_ADMIN)) {
    return null;
  }

  return (
    <SuperAdminProvider>
      <main className="min-h-screen bg-slate-50">
        {children}
      </main>
    </SuperAdminProvider>
  );
}
