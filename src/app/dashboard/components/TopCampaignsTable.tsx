'use client';

import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

// BACKEND INTEGRATION: GET /api/campaigns/top?limit=6 → top performing campaigns by ROAS

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

const platformColors: Record<string, string> = {
  Meta: 'bg-blue-50 text-blue-700',
  Google: 'bg-red-50 text-red-600',
  TikTok: 'bg-slate-800 text-white',
  LinkedIn: 'bg-sky-50 text-sky-700',
};

const stageColors: Record<string, string> = {
  'Shooting': 'bg-amber-50 text-amber-700',
  'Editing': 'bg-violet-50 text-violet-700',
  'Ads Live': 'bg-emerald-50 text-emerald-700',
  'Review': 'bg-blue-50 text-blue-700',
};

const topCampaigns: CampaignRow[] = [
  { id: 'camp-001', name: 'Spring Collection Launch', client: 'Luma Apparel', platform: 'Meta', stage: 'Ads Live', spend: '$8,420', leads: 624, roas: 5.8, roasTrend: 'up', progress: 82 },
  { id: 'camp-002', name: 'Q2 Lead Gen Drive', client: 'Nexus Capital', platform: 'Google', stage: 'Ads Live', spend: '$12,100', leads: 891, roas: 4.9, roasTrend: 'up', progress: 91 },
  { id: 'camp-003', name: 'Product Reveal Reel', client: 'Orion Fitness', platform: 'TikTok', stage: 'Editing', spend: '$3,200', leads: 210, roas: 3.1, roasTrend: 'flat', progress: 45 },
  { id: 'camp-004', name: 'B2B Awareness Push', client: 'Synapse Tech', platform: 'LinkedIn', stage: 'Ads Live', spend: '$6,750', leads: 178, roas: 4.2, roasTrend: 'up', progress: 74 },
  { id: 'camp-005', name: 'Summer Sale Blitz', client: 'Coral Beauty', platform: 'Meta', stage: 'Shooting', spend: '$1,800', leads: 94, roas: 2.4, roasTrend: 'down', progress: 18 },
  { id: 'camp-006', name: 'Reactivation Campaign', client: 'Pulse Nutrition', platform: 'Google', stage: 'Review', spend: '$4,500', leads: 312, roas: 3.9, roasTrend: 'up', progress: 96 },
];

export default function TopCampaignsTable() {
  const router = useRouter();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800">Top Campaigns</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Ranked by ROAS · April 2026</p>
        </div>
        <button
          onClick={() => router.push('/campaign-management')}
          className="flex items-center gap-1 text-[12px] text-violet-600 hover:text-violet-700 font-semibold transition-colors"
        >
          View all <ExternalLink size={12} />
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-slate-500 font-semibold">Campaign</th>
              <th className="text-left px-3 py-2.5 text-slate-500 font-semibold">Platform</th>
              <th className="text-left px-3 py-2.5 text-slate-500 font-semibold">Stage</th>
              <th className="text-right px-3 py-2.5 text-slate-500 font-semibold">Spend</th>
              <th className="text-right px-3 py-2.5 text-slate-500 font-semibold">Leads</th>
              <th className="text-right px-5 py-2.5 text-slate-500 font-semibold">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {topCampaigns.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer ${
                  idx % 2 === 0 ? '' : 'bg-slate-50/30'
                }`}
                onClick={() => router.push('/campaign-management')}
              >
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-slate-800 truncate max-w-[180px]">{row.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{row.client}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${platformColors[row.platform]}`}>
                    {row.platform}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${stageColors[row.stage] || 'bg-slate-100 text-slate-600'}`}>
                    {row.stage}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">{row.spend}</td>
                <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">{row.leads.toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`font-bold font-mono tabular-nums ${row.roas >= 4 ? 'text-emerald-600' : row.roas >= 3 ? 'text-slate-700' : 'text-red-500'}`}>
                      {row.roas}×
                    </span>
                    {row.roasTrend === 'up' && <ArrowUpRight size={12} className="text-emerald-500" />}
                    {row.roasTrend === 'down' && <ArrowUpRight size={12} className="text-red-400 rotate-90" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}