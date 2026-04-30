'use client';

import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { AuthUser, Campaign } from '@/types';

interface TodayReportingCardProps {
  user: AuthUser | null;
  campaigns: Campaign[];
}

/**
 * TodayReportingCard
 * Purpose: Simplified summary of today's performance metrics.
 * Localized Logic: Absorbed from reportingService and reportingAgent.
 */
export default function TodayReportingCard({ user, campaigns }: TodayReportingCardProps) {
  // Aggregate report data locally
  const report = useMemo(() => {
    if (!user || (user.role !== 'Ads Manager' && user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Social Media Manager')) {
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Filter campaigns assigned to this user
    const assignedCampaigns = campaigns.filter(c => 
      c.assignee === user.name || c.assignedAdsManagerId === user.id
    );

    // 2. Identify campaigns with logs updated today
    const updatedToday = assignedCampaigns.filter(c => 
      c.performanceHistory?.some(log => log.date === todayStr)
    );

    const pendingToday = assignedCampaigns.length - updatedToday.length;

    // 3. Aggregate total metrics for today's logs
    const todayMetrics = updatedToday.reduce((acc, c) => {
      const todayLog = c.performanceHistory?.find(log => log.date === todayStr);
      if (todayLog) {
        acc.spent += todayLog.addedSpend || 0;
        acc.leads += todayLog.addedLeads || 0;
      }
      return acc;
    }, { spent: 0, leads: 0 });

    return {
      totalCampaigns: assignedCampaigns.length,
      updatedToday: updatedToday.length,
      pendingToday: pendingToday,
      metrics: {
        spent: todayMetrics.spent,
        leads: todayMetrics.leads,
        roas: todayMetrics.spent > 0 ? (todayMetrics.leads * 10) / todayMetrics.spent : 0
      }
    };
  }, [campaigns, user]);

  if (!report) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-violet-600" />
          <h3 className="text-[13.5px] font-bold text-slate-800 uppercase">Today's Performance Overview</h3>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 transition-all hover:border-violet-200 group">
            <div className="flex items-center gap-2 mb-1.5 text-slate-500">
              <DollarSign size={14} className="group-hover:text-violet-500 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Total Spend Today</span>
            </div>
            <p className="text-[18px] font-black text-slate-900">
              ₹{report.metrics.spent.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 transition-all hover:border-pink-200 group">
            <div className="flex items-center gap-2 mb-1.5 text-slate-500">
              <Target size={14} className="group-hover:text-pink-500 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Leads Generated</span>
            </div>
            <p className="text-[18px] font-black text-slate-900">
              {report.metrics.leads}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
