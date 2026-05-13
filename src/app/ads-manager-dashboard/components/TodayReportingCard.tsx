'use client';

import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { AuthUser, Campaign } from '@/types';
import { STATIC_STRINGS, PAGE_ROLES } from '@/utils/constants';

interface TodayReportingCardProps {
  user: AuthUser | null;
  campaigns: Campaign[];
}

export default function TodayReportingCard({ user, campaigns }: TodayReportingCardProps) {
  const reportData = useMemo(() => {
    if (!user || !(PAGE_ROLES.ADS_TRACKING as readonly string[]).includes(user.role)) {
      return null;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const userCampaigns = campaigns.filter(campaign =>
      campaign.assignee === user.name || campaign.assignedAdsManagerId === user.id
    );
    const updatedCampaigns = userCampaigns.filter(campaign =>
      campaign.performanceHistory?.some(log => log.date === todayDate)
    );

    const metrics = updatedCampaigns.reduce((totals, campaign) => {
      const todayLog = campaign.performanceHistory?.find(log => log.date === todayDate);
      if (todayLog) {
        totals.spent += todayLog.addedSpend || 0;
        totals.leads += todayLog.addedLeads || 0;
      }
      return totals;
    }, { spent: 0, leads: 0 });

    return {
      metrics: {
        ...metrics,
        roas: metrics.spent > 0 ? (metrics.leads * 10) / metrics.spent : 0
      }
    };
  }, [campaigns, user]);

  if (!reportData) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
        <h2 className="text-[16px] font-bold text-slate-800">
          {STATIC_STRINGS.ADS_REPORT_TITLE}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Ad Spend Card */}
        <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-emerald-200 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{reportData.metrics.spent.toLocaleString()}
            </p>
            <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
              {STATIC_STRINGS.ADS_REPORT_TOTAL_SPEND}
            </p>
          </div>
        </article>

        {/* Total Leads Generated Card */}
        <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-violet-200 group">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-105 transition-transform">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {reportData.metrics.leads.toLocaleString()}
            </p>
            <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
              {STATIC_STRINGS.ADS_REPORT_LEADS_GENERATED}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
