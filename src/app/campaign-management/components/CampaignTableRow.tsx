'use client';

import React from 'react';
import { TrendingUp, Edit2, Trash2, History } from 'lucide-react';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { CAMPAIGN_STATUS_STYLES, CAMPAIGN_STAGE_STYLES, PLATFORM_STYLES } from '@/utils/ui-configs';
import { Campaign } from '../types';

interface CampaignTableRowProps {
  campaign: Campaign;
  idx: number;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onLog: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onHistory: (campaign: Campaign) => void;
  userRole?: string;
  isCritical: boolean;
}

const CampaignTableRow: React.FC<CampaignTableRowProps> = ({
  campaign,
  idx,
  isSelected,
  onToggle,
  onLog,
  onEdit,
  onDelete,
  onHistory,
  userRole,
  isCritical,
}) => {
  return (
    <tr
      className={`border-b border-slate-50 last:border-0 transition-colors ${
        isSelected
          ? 'bg-violet-50/60'
          : idx % 2 === 0
          ? 'hover:bg-slate-50/70'
          : 'bg-slate-50/20 hover:bg-slate-50/70'
      }`}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(campaign.id)}
          className="w-3.5 h-3.5 rounded border-slate-300 accent-violet-600 cursor-pointer"
        />
      </td>
      <td className="px-3 py-3 max-w-[180px]">
        <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
      </td>
      <td className="px-3 py-3 text-slate-600 truncate max-w-[120px]">
        {campaign.client}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
            CAMPAIGN_STATUS_STYLES[campaign.status]
          }`}
        >
          {campaign.status}
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
            CAMPAIGN_STAGE_STYLES[campaign.stage]
          }`}
        >
          {campaign.stage}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
            {campaign.assigneeInitials}
          </div>
          <span className="text-slate-600 truncate max-w-[80px]">
            {campaign.assignee}
          </span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
            PLATFORM_STYLES[campaign.platform]
          }`}
        >
          {campaign.platform}
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={`font-medium ${isCritical ? 'text-red-600' : 'text-slate-600'}`}
        >
          {campaign.deadline} {isCritical && '⚠'}
        </span>
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-slate-700 font-mono">
        {campaign.spend}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-slate-700 font-mono">
        {(campaign.leads ?? 0).toLocaleString()}
      </td>
      <td className="px-3 py-3 text-right">
        <span
          className={`font-bold tabular-nums font-mono ${
            campaign.roas >= 4
              ? 'text-emerald-600'
              : campaign.roas >= 2.5
              ? 'text-slate-700'
              : 'text-red-500'
          }`}
        >
          {campaign.roas > 0 ? `${campaign.roas}×` : '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-0.5">
          <button
            onClick={() => onLog(campaign)}
            title={STATIC_STRINGS.CAMPAIGN_MGMT_LOG_PERFORMANCE}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <TrendingUp size={13} />
          </button>
          <button
            onClick={() => onEdit(campaign)}
            title={STATIC_STRINGS.CAMPAIGN_MGMT_EDIT}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(campaign)}
            title={STATIC_STRINGS.CAMPAIGN_MGMT_DELETE}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          {userRole === ROLES.OWNER && (
            <button
              onClick={() => onHistory(campaign)}
              title={STATIC_STRINGS.CAMPAIGN_MGMT_AUDIT_HISTORY}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <History size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CampaignTableRow;
