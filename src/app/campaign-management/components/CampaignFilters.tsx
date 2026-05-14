'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { STATIC_STRINGS, CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_STAGE_OPTIONS, PRIORITY_OPTIONS } from '@/utils/constants';

interface CampaignFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: any) => void;
  stageFilter: string;
  onStageFilterChange: (val: any) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stageFilter,
  onStageFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onClearFilters,
  hasFilters,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={STATIC_STRINGS.CAMPAIGN_MGMT_SEARCH_PLACEHOLDER}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
      >
        <option value="">{STATIC_STRINGS.CAMPAIGN_MGMT_ALL_STATUSES}</option>
        {CAMPAIGN_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>


      <select
        value={stageFilter}
        onChange={(e) => onStageFilterChange(e.target.value)}
        className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
      >
        <option value="">{STATIC_STRINGS.CAMPAIGN_MGMT_ALL_STAGES}</option>
        {CAMPAIGN_STAGE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityFilterChange(e.target.value)}
        className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
      >
        <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_PRIORITY}</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 text-[12px] text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X size={12} /> {STATIC_STRINGS.FORM_CANCEL}
        </button>
      )}
    </div>
  );
};

export default CampaignFilters;
