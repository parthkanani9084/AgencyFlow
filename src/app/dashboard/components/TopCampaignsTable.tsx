'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { STATIC_STRINGS } from '@/utils/constants';
import { PLATFORM_STYLES, UI_PALETTE } from '@/utils/ui-configs';

interface CampaignRow {
  id: string;
  name: string;
  client: string;
  platform: 'Meta' | 'Google' | 'TikTok' | 'LinkedIn';
  stage: string;
  spend: string;
  leads: number;
  roas: number;
  roasTrend: 'up' | 'down' | 'flat';
  progress: number;
}

const STAGE_COLORS: Record<string, string> = {
  [STATIC_STRINGS.DASHBOARD_STAGE_ADS_LIVE]: UI_PALETTE.SUCCESS,
  [STATIC_STRINGS.DASHBOARD_STAGE_REVIEW]: UI_PALETTE.INFO,
  [STATIC_STRINGS.DASHBOARD_STAGE_EDITING]: UI_PALETTE.WARNING,
  [STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING]: UI_PALETTE.PRIMARY,
};

const TOP_CAMPAIGNS: CampaignRow[] = [
  { id: 'camp-001', name: 'Spring Collection Launch', client: 'Luma Apparel', platform: 'Meta', stage: STATIC_STRINGS.DASHBOARD_STAGE_ADS_LIVE, spend: '$8,420', leads: 624, roas: 5.8, roasTrend: 'up', progress: 82 },
  { id: 'camp-002', name: 'Q2 Lead Gen Drive', client: 'Nexus Capital', platform: 'Google', stage: STATIC_STRINGS.DASHBOARD_STAGE_ADS_LIVE, spend: '$12,100', leads: 891, roas: 4.9, roasTrend: 'up', progress: 91 },
  { id: 'camp-003', name: 'Product Reveal Reel', client: 'Orion Fitness', platform: 'TikTok', stage: STATIC_STRINGS.DASHBOARD_STAGE_EDITING, spend: '$3,200', leads: 210, roas: 3.1, roasTrend: 'flat', progress: 45 },
  { id: 'camp-004', name: 'B2B Awareness Push', client: 'Synapse Tech', platform: 'LinkedIn', stage: STATIC_STRINGS.DASHBOARD_STAGE_ADS_LIVE, spend: '$6,750', leads: 178, roas: 4.2, roasTrend: 'up', progress: 74 },
  { id: 'camp-005', name: 'Summer Sale Blitz', client: 'Coral Beauty', platform: 'Meta', stage: STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING, spend: '$1,800', leads: 94, roas: 2.4, roasTrend: 'down', progress: 18 },
  { id: 'camp-006', name: 'Reactivation Campaign', client: 'Pulse Nutrition', platform: 'Google', stage: STATIC_STRINGS.DASHBOARD_STAGE_REVIEW, spend: '$4,500', leads: 312, roas: 3.9, roasTrend: 'up', progress: 96 },
];


export default function TopCampaignsTable() {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(STATIC_STRINGS.DASHBOARD_ROUTE_CAMPAIGN_MGMT);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Table Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.DASHBOARD_TOP_CAMPAIGNS_TITLE}</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">{STATIC_STRINGS.DASHBOARD_TOP_CAMPAIGNS_SUBTITLE} · {STATIC_STRINGS.DASHBOARD_MONTH_YEAR}</p>
        </div>
        <button
          onClick={handleRowClick}
          className="flex items-center gap-1 text-[12px] text-violet-600 hover:text-violet-700 font-semibold transition-colors"
        >
          {STATIC_STRINGS.CAMPAIGN_MGMT_VIEW_ALL} <ExternalLink size={12} />
        </button>
      </header>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto scrollbar-thin flex-1">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.CAMPAIGN_MGMT_TABLE_COL_NAME}</th>
              <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_PLATFORM}</th>
              <th className="text-left px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.CAMPAIGN_FIELD_STAGE}</th>
              <th className="text-right px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_SPEND}</th>
              <th className="text-right px-3 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_LEADS}</th>
              <th className="text-right px-5 py-2.5 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_ROAS}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {TOP_CAMPAIGNS.map((row, idx) => (
              <tr
                key={row.id}
                onClick={handleRowClick}
                className={`group hover:bg-slate-50/70 transition-colors cursor-pointer ${
                  idx % 2 === 0 ? '' : 'bg-slate-50/20'
                }`}
              >
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-slate-800 truncate max-w-[180px] group-hover:text-violet-700 transition-colors">
                      {row.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{row.client}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-tight ${PLATFORM_STYLES[row.platform]}`}>
                    {row.platform}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-tight ${STAGE_COLORS[row.stage] || 'bg-slate-100 text-slate-600'}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums font-medium">
                  {row.spend}
                </td>
                <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums font-medium">
                  {row.leads.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`font-bold font-mono tabular-nums text-[13px] ${
                      row.roas >= 4 ? 'text-emerald-600' : row.roas >= 3 ? 'text-slate-700' : 'text-red-500'
                    }`}>
                      {row.roas}×
                    </span>
                    {row.roasTrend === 'up' && <ArrowUpRight size={13} className="text-emerald-500" />}
                    {row.roasTrend === 'down' && <ArrowDownRight size={13} className="text-red-400" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}