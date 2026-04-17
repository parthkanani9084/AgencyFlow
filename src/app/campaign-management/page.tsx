import React from 'react';
import AppLayout from '@/components/AppLayout';
import CampaignTable from './components/CampaignTable';
import { Toaster } from 'sonner';

export default function CampaignManagementPage() {
  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <CampaignTable />
      </div>
    </AppLayout>
  );
}