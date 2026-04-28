'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Download, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const dateRanges = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Year to Date', value: 'ytd' },
];

export default function DashboardHeader() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // BACKEND INTEGRATION: re-fetch dashboard metrics
    await new Promise((r) => setTimeout(r, 900));
    const now = new Date();
    setLastUpdated(now?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Overview</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12.5px] text-slate-500">
            Live data
            {lastUpdated && <> · Last updated at <span className="font-medium text-slate-600">{lastUpdated}</span></>}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 h-[38px] text-[12.5px] font-medium border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all hover:bg-slate-50"
          >
            {dateRanges.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 h-[38px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150 disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-3 h-[38px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={() => router?.push('/campaign-management')}
          className="flex items-center gap-1.5 px-3.5 h-[38px] rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Campaign</span>
        </button>
      </div>
    </div>
  );
}