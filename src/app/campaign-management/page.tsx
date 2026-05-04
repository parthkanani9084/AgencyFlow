'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import CampaignTable from './components/CampaignTable';
import { Toaster } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';

export default function CampaignManagementPage() {
  useRoleGuard(PAGE_ROLES.CAMPAIGN_MANAGEMENT as unknown as UserRole[]);

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <CampaignTable />
      </div>
    </AppLayout>
  );
}