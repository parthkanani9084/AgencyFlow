'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import CampaignTable from './components/CampaignTable';
import { Toaster } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function CampaignManagementPage() {
  useRoleGuard(['Owner', 'Manager', 'Ads Manager', 'Social Media Manager']);

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <CampaignTable />
      </div>
    </AppLayout>
  );
}