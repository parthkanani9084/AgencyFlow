'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { STATIC_STRINGS, CAMPAIGN_SORT_FIELDS } from '@/utils/constants';

type SortField = 'name' | 'client' | 'deadline' | 'leads' | 'roas' | 'spend' | null;
type SortDir = 'asc' | 'desc';

interface CampaignTableHeadProps {
  currentSort: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
}

const SortIcon = ({ field, currentSort, sortDir }: { field: SortField; currentSort: SortField; sortDir: SortDir }) => {
  if (currentSort !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
  return sortDir === 'asc' ? (
    <ChevronUp size={12} className="text-violet-600" />
  ) : (
    <ChevronDown size={12} className="text-violet-600" />
  );
};

const CampaignTableHead: React.FC<CampaignTableHeadProps> = ({
  currentSort,
  sortDir,
  onSort,
  onSelectAll,
  isAllSelected,
}) => {
  return (
    <thead>
      <tr className="bg-slate-50 border-b border-slate-100">
        <th className="px-4 py-3 w-10">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            className="w-3.5 h-3.5 rounded border-slate-300 accent-violet-600 cursor-pointer"
          />
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.NAME as any)}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_NAME}{' '}
            <SortIcon field="name" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.CLIENT as any)}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT}{' '}
            <SortIcon field="client" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          {STATIC_STRINGS.CAMPAIGN_FIELD_STATUS}
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold whitespace-nowrap">
          {STATIC_STRINGS.CAMPAIGN_FIELD_STAGE}
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          {STATIC_STRINGS.CAMPAIGN_FIELD_ASSIGNEE}
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          {STATIC_STRINGS.CAMPAIGN_FIELD_PLATFORM}
        </th>
        <th className="text-left px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.DEADLINE as any)}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_DEADLINE}{' '}
            <SortIcon field="deadline" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="text-right px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.SPEND as any)}
            className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_SPEND}{' '}
            <SortIcon field="spend" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="text-right px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.LEADS as any)}
            className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_LEADS}{' '}
            <SortIcon field="leads" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="text-right px-3 py-3 text-slate-500 font-semibold">
          <button
            onClick={() => onSort(CAMPAIGN_SORT_FIELDS.ROAS as any)}
            className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_FIELD_ROAS}{' '}
            <SortIcon field="roas" currentSort={currentSort} sortDir={sortDir} />
          </button>
        </th>
        <th className="px-4 py-3 w-20 text-slate-500 font-semibold text-center">
          {STATIC_STRINGS.TABLE_ACTIONS}
        </th>
      </tr>
    </thead>
  );
};

export default CampaignTableHead;
