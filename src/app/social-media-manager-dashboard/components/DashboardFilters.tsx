'use client';

import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { STATIC_STRINGS, REEL_STATUSES } from '@/utils/constants';

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  const tabs = useMemo(() => [
    { key: REEL_STATUSES.ALL, label: STATIC_STRINGS.SMM_TAB_ALL },
    { key: REEL_STATUSES.SCHEDULED, label: STATIC_STRINGS.SMM_TAB_SCHEDULED },
    { key: REEL_STATUSES.PRODUCTION, label: STATIC_STRINGS.SMM_TAB_PRODUCTION },
    { key: REEL_STATUSES.UPLOADED, label: STATIC_STRINGS.SMM_TAB_UPLOADED },
  ], []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-8 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder={STATIC_STRINGS.SMM_SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[13.5px] placeholder-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
