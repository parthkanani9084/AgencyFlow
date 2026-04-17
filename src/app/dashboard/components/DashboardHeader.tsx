'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    <div className="flex items-start justify-between mb-6">
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
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150 disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-all duration-150"
        >
          <Download size={13} />
          Export
        </button>
        <button
          onClick={() => router?.push('/campaign-management')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150"
        >
          <Plus size={13} />
          New Campaign
        </button>
      </div>
    </div>
  );
}