'use client';

import React, { useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import MetricSection, { 
  clientMetrics, 
  revenueMetrics, 
  reelsMetrics, 
  metaAdsMetrics, 
  todoMetrics 
} from './components/MetricsBentoGrid';
// import DashboardCharts from './components/DashboardCharts';
// import ActivityFeed from './components/ActivityFeed';
// import TopCampaignsTable from './components/TopCampaignsTable';
import DashboardHeader from './components/DashboardHeader';

import { useRoleGuard } from '@/hooks/useRoleGuard';
import { STATIC_STRINGS, PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';
import { useGetDashboard } from '@/api/hooks/useDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  useRoleGuard(PAGE_ROLES.ADS_TRACKING as unknown as UserRole[]);
  
  const { data: dashboardData, isLoading } = useGetDashboard();
  const metrics = (dashboardData as any)?.results;

  const dynamicClientMetrics = useMemo(() => [
    { ...clientMetrics[0], value: (metrics?.client_summary?.total_client_count || 0).toLocaleString() }
  ], [metrics]);

  const dynamicRevenueMetrics = useMemo(() => {

    return [
      { ...revenueMetrics[0], value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0` },
      { 
        ...revenueMetrics[1], 
        value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`, 
        subValue: `0.0% ${STATIC_STRINGS.DASHBOARD_METRIC_EFFICIENCY}` 
      },
      { ...revenueMetrics[2], value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0` }
    ];
  }, []);

  const dynamicReelsMetrics = useMemo(() => [
    { 
      ...reelsMetrics[0], 
      value: (metrics?.reels_summary?.today_schedule_count || 0).toString(), 
      subValue: STATIC_STRINGS.DASHBOARD_METRIC_SCHEDULED_TODAY 
    },
    { 
      ...reelsMetrics[1], 
      value: (metrics?.reels_summary?.pending_status_count || 0).toString(),
      subValue: STATIC_STRINGS.DASHBOARD_METRIC_AWAITING_RAW
    },
    { 
      ...reelsMetrics[2], 
      value: (metrics?.reels_summary?.processing_status_count || 0).toString(), 
      subValue: STATIC_STRINGS.DASHBOARD_METRIC_EDITING_QUEUE 
    },
  ], [metrics]);

  const dynamicMetaAdsMetrics = useMemo(() => {
    const today = metrics?.meta_ads_summary?.today;

    return [
      { 
        ...metaAdsMetrics[0], 
        value: `${STATIC_STRINGS.CURRENCY_SYMBOL}${(today?.ads_spend || 0).toLocaleString()}`,

      },
      { 
        ...metaAdsMetrics[1], 
        value: (today?.leads || 0).toLocaleString(),

      },
      { 
        ...metaAdsMetrics[2], 
        value: `${today?.average_roas || 0}×`, 
      
      },
      {
        ...metaAdsMetrics[3],
        value: (today?.active_campaign || 0).toString(),

      }
    ];
  }, [metrics]);

  const dynamicTodoMetrics = useMemo(() => [
    { 
      ...todoMetrics[0], 
      value: (metrics?.to_do?.not_completed_task_count || 0).toString(),
      subValue: 'Total not completed'
    },
    { 
      ...todoMetrics[1], 
      value: (metrics?.to_do?.overdue_task_count || 0).toString(),
      subValue: 'Requires immediate action'
    },
  ], [metrics]);

  return (
    <AppLayout>
      <main className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
            <p className="text-[14px] text-slate-500 font-medium">Loading dashboard metrics...</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_CLIENT_SUMMARY} metrics={dynamicClientMetrics} cols={3} />
            {/* Revenue section is currently hidden as it's not in the API response */}
            {/* <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_REVENUE} metrics={dynamicRevenueMetrics} cols={3} /> */}
            <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_REELS} metrics={dynamicReelsMetrics} cols={3} />
            <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_META_ADS} metrics={dynamicMetaAdsMetrics} cols={4} />
            <MetricSection title={STATIC_STRINGS.DASHBOARD_METRIC_TODO} metrics={dynamicTodoMetrics} cols={2} />
          </div>
        )}
      </main>
    </AppLayout>
  );
}