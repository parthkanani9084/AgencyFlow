'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { STATIC_STRINGS, ADS_DATE_RANGE_OPTIONS, ROLES } from '@/utils/constants';
import { ChevronDown, Download, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DATE_RANGES = ADS_DATE_RANGE_OPTIONS;

export default function DashboardHeader() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<string>(STATIC_STRINGS.DASHBOARD_DEFAULT_DATE_RANGE);

  const updateTimestamp = useCallback(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, []);

  useEffect(() => {
    updateTimestamp();
  }, [updateTimestamp]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      updateTimestamp();
    } catch (error) {

    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateCampaign = () => {
    router.push(STATIC_STRINGS.DASHBOARD_ROUTE_CAMPAIGN_MGMT);
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.DASHBOARD_OVERVIEW_TITLE}</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12.5px] text-slate-500">
            {STATIC_STRINGS.DASHBOARD_LIVE_DATA}
            {lastUpdated && (
              <> · {STATIC_STRINGS.DASHBOARD_LAST_UPDATED} <span className="font-medium text-slate-600">{lastUpdated}</span></>
            )}
          </span>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        {/* Date Range Selector */}
        <div className="relative group">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 h-[38px] text-[12.5px] font-medium border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all hover:bg-slate-50 cursor-pointer"
            aria-label={STATIC_STRINGS.DASHBOARD_ARIA_DATE_RANGE}
          >
            {DATE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown
            size={13} 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" 
          />
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 h-[38px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150 disabled:opacity-60"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{STATIC_STRINGS.DASHBOARD_REFRESH}</span>
        </button>

        <button
          className="flex items-center gap-1.5 px-3 h-[38px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150"
          title={STATIC_STRINGS.CAMPAIGN_MGMT_EXPORT}
        >
          <Download size={13} />
          <span className="hidden sm:inline">{STATIC_STRINGS.CAMPAIGN_MGMT_EXPORT}</span>
        </button>

        {user?.role !== ROLES.ADS_MANAGER && (
          <button
            onClick={handleCreateCampaign}
            className="flex items-center gap-1.5 px-3.5 h-[38px] rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150 shadow-sm"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">{STATIC_STRINGS.DASHBOARD_NEW_CAMPAIGN}</span>
          </button>
        )}
      </nav>
    </header>
  );
}