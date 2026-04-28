'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import MetricSection, { clientMetrics, revenueMetrics, reelsMetrics, metaAdsMetrics, todoMetrics } from './components/MetricsBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import ActivityFeed from './components/ActivityFeed';
import TopCampaignsTable from './components/TopCampaignsTable';
import DashboardHeader from './components/DashboardHeader';
import { Toaster } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAdsData } from '@/context/AdsDataContext';

export default function DashboardPage() {
  useRoleGuard(['Owner']);
  const { adsMetrics } = useAdsData();
  const [clientStats, setClientStats] = React.useState({ total: 0, sales: 0, collection: 0 });

  React.useEffect(() => {
    const savedClients = localStorage.getItem('agencyflow_clients');
    if (savedClients) {
      try {
        const clients = JSON.parse(savedClients);
        const total = clients.length;
        const collection = clients.reduce((sum: number, c: any) => 
          sum + (c.payments?.reduce((pSum: number, p: any) => pSum + p.amount, 0) || 0), 0);
        const sales = clients.reduce((sum: number, c: any) => sum + (c.packageAmount || 0), 0);
        setClientStats({ total, sales, collection });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const dynamicClientMetrics = [
    { ...clientMetrics[0], value: clientStats.total.toLocaleString() }
  ];

  const dynamicMetaAdsMetrics = [
    { ...metaAdsMetrics[0], value: `₹${adsMetrics.totalSpend.toLocaleString()}` },
    { ...metaAdsMetrics[1], value: adsMetrics.totalLeads.toLocaleString() },
    { ...metaAdsMetrics[2], value: `${adsMetrics.avgRoas}×` },
    metaAdsMetrics[3]
  ];

  const pendingRevenue = Math.max(0, clientStats.sales - clientStats.collection);
  const collectionEfficiency = clientStats.sales > 0 
    ? ((clientStats.collection / clientStats.sales) * 100).toFixed(1) 
    : '0.0';

  const dynamicRevenueMetrics = [
    { ...revenueMetrics[0], value: `₹${clientStats.sales.toLocaleString()}` },
    { ...revenueMetrics[1], value: `₹${clientStats.collection.toLocaleString()}`, subValue: `${collectionEfficiency}% efficiency` },
    { ...revenueMetrics[2], value: `₹${pendingRevenue.toLocaleString()}` }
  ];

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        
        <div className="mt-6">
          <MetricSection title="Client Summary" metrics={dynamicClientMetrics} cols={3} />
          <MetricSection 
            title="Revenue" 
            metrics={dynamicRevenueMetrics} 
            cols={3} 
          />
          <MetricSection title="Reels" metrics={reelsMetrics} cols={3} />
          <MetricSection title="Meta Ads" metrics={dynamicMetaAdsMetrics} cols={4} />
          <MetricSection title="To-Do" metrics={todoMetrics} cols={2} />
        </div>

        <div className="mt-8">
          <DashboardCharts />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-8">
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