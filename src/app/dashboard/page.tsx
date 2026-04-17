import React from 'react';
import AppLayout from '@/components/AppLayout';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import ActivityFeed from './components/ActivityFeed';
import TopCampaignsTable from './components/TopCampaignsTable';
import DashboardHeader from './components/DashboardHeader';
import { Toaster } from 'sonner';

export default function DashboardPage() {
  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        <MetricsBentoGrid />
        <DashboardCharts />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
          <div className="xl:col-span-2">
            <TopCampaignsTable />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}