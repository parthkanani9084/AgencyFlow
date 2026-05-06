'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricSection, { 
  clientMetrics, 
  revenueMetrics, 
  reelsMetrics, 
  metaAdsMetrics, 
  todoMetrics 
} from './components/MetricsBentoGrid';
import DashboardCharts from './components/DashboardCharts';
import ActivityFeed from './components/ActivityFeed';
import TopCampaignsTable from './components/TopCampaignsTable';
import DashboardHeader from './components/DashboardHeader';

import { useAdsData } from '@/context/AdsDataContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { STATIC_STRINGS, STORAGE_KEYS, PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';
interface ClientData {
  id: string;
  name: string;
  packageAmount: number;
  payments: { amount: number }[];
}


export default function DashboardPage() {
  useRoleGuard(PAGE_ROLES.ADS_TRACKING as unknown as UserRole[]);
  const { adsMetrics } = useAdsData();
  const [clientStats, setClientStats] = useState({ total: 0, sales: 0, collection: 0 });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedClients = localStorage.getItem(STORAGE_KEYS.USER_DATA === 'user_data' ? 'agencyflow_clients' : STORAGE_KEYS.CAMPAIGNS);
    if (!savedClients) return;

    try {
      const clients: ClientData[] = JSON.parse(savedClients);
      
      const total = clients.length;
      const collection = clients.reduce((sum, client) => {
        const clientPaid = client.payments?.reduce((pSum, payment) => pSum + payment.amount, 0) || 0;
        return sum + clientPaid;
      }, 0);
      
      const sales = clients.reduce((sum, client) => sum + (client.packageAmount || 0), 0);
      
      setClientStats({ total, sales, collection });
    } catch (error) {
      console.error('[Dashboard] Failed to hydrate client stats:', error);
    }
  }, []);
  const dynamicClientMetrics = useMemo(() => [
    { ...clientMetrics[0], value: clientStats.total.toLocaleString() }
  ], [clientStats.total]);

  const dynamicMetaAdsMetrics = useMemo(() => [
    { ...metaAdsMetrics[0], value: `₹${adsMetrics.totalSpend.toLocaleString()}` },
    { ...metaAdsMetrics[1], value: adsMetrics.totalLeads.toLocaleString() },
    { ...metaAdsMetrics[2], value: `${adsMetrics.avgRoas}×` },
    metaAdsMetrics[3]
  ], [adsMetrics]);

  const dynamicRevenueMetrics = useMemo(() => {
    const pendingRevenue = Math.max(0, clientStats.sales - clientStats.collection);
    const collectionEfficiency = clientStats.sales > 0 
      ? ((clientStats.collection / clientStats.sales) * 100).toFixed(1) 
      : '0.0';

    return [
      { ...revenueMetrics[0], value: `₹${clientStats.sales.toLocaleString()}` },
      { 
        ...revenueMetrics[1], 
        value: `${STATIC_STRINGS.CURRENCY_SYMBOL}${clientStats.collection.toLocaleString()}`, 
        subValue: `${collectionEfficiency}% ${STATIC_STRINGS.DASHBOARD_METRIC_EFFICIENCY}` 
      },
      { ...revenueMetrics[2], value: `₹${pendingRevenue.toLocaleString()}` }
    ];
  }, [clientStats]);

  return (
    <AppLayout>
      <main className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        
        <div className="mt-6 space-y-6">
          <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_CLIENT_SUMMARY} metrics={dynamicClientMetrics} cols={3} />
          <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_REVENUE} metrics={dynamicRevenueMetrics} cols={3} />
          <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_REELS} metrics={reelsMetrics} cols={3} />
          <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_META_ADS} metrics={dynamicMetaAdsMetrics} cols={4} />
          <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_TODO} metrics={todoMetrics} cols={2} />
        </div>

        <section className="mt-8">
          <DashboardCharts />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-8">
          <div className="xl:col-span-2">
            <TopCampaignsTable />
          </div>
          <aside>
            <ActivityFeed />
          </aside>
        </section>
      </main>
    </AppLayout>
  );
}