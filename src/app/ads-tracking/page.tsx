'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  TrendingUp, IndianRupee, Users, Target, ChevronDown,
  ArrowUpRight, ArrowDownRight, BarChart3, X
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useAdsData } from '@/context/AdsDataContext';

interface AdCampaign {
  id: string;
  name: string;
  client: string;
  platform: 'Meta' | 'Google' | 'TikTok' | 'Instagram';
  budget: number;
  spent: number;
  leads: number;
  clicks: number;
  impressions: number;
  roas: number;
  status: 'active' | 'paused' | 'completed';
}

const AD_CAMPAIGNS: AdCampaign[] = [
  { id: 'ac1', name: 'NovaBrew Spring Launch',   client: 'Jordan Lee',    platform: 'Meta',      budget: 5000,  spent: 3800,  leads: 142, clicks: 2840, impressions: 48000, roas: 4.1, status: 'active' },
  { id: 'ac2', name: 'PulseWear Q2 Reel',        client: 'Samantha Cruz', platform: 'Instagram', budget: 3500,  spent: 3500,  leads: 218, clicks: 4100, impressions: 72000, roas: 3.8, status: 'completed' },
  { id: 'ac3', name: 'GreenRoot Awareness',      client: 'Ethan Patel',   platform: 'Meta',      budget: 8000,  spent: 4200,  leads: 310, clicks: 5600, impressions: 95000, roas: 5.2, status: 'active' },
  { id: 'ac4', name: 'LuxeHome Interior Series', client: 'Mia Tanaka',    platform: 'Google',    budget: 2000,  spent: 800,   leads: 34,  clicks: 920,  impressions: 18000, roas: 2.9, status: 'active' },
  { id: 'ac5', name: 'NovaBrew Brand Awareness', client: 'Jordan Lee',    platform: 'TikTok',    budget: 2500,  spent: 2500,  leads: 88,  clicks: 3200, impressions: 120000, roas: 3.2, status: 'completed' },
  { id: 'ac6', name: 'PulseWear Google Search',  client: 'Samantha Cruz', platform: 'Google',    budget: 1500,  spent: 1500,  leads: 118, clicks: 2100, impressions: 31000, roas: 4.6, status: 'completed' },
];

const WEEKLY_DATA = [
  { week: 'Week 1', spend: 3200, leads: 120, clicks: 4800 },
  { week: 'Week 2', spend: 4800, leads: 198, clicks: 7200 },
  { week: 'Week 3', spend: 6100, leads: 265, clicks: 9400 },
  { week: 'Week 4', spend: 7200, leads: 327, clicks: 11200 },
];

const PLATFORM_BREAKDOWN = [
  { platform: 'Meta',      spend: 8000,  leads: 452, color: '#1877f2' },
  { platform: 'Google',    spend: 2300,  leads: 152, color: '#34a853' },
  { platform: 'Instagram', spend: 3500,  leads: 218, color: '#e1306c' },
  { platform: 'TikTok',    spend: 2500,  leads: 88,  color: '#010101' },
];

const PLATFORM_STYLES: Record<string, string> = {
  Meta:      'bg-blue-100 text-blue-700',
  Google:    'bg-green-100 text-green-700',
  Instagram: 'bg-pink-100 text-pink-700',
  TikTok:    'bg-slate-100 text-slate-700',
};

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  paused:    'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
};

const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

export default function AdsTrackingPage() {
  useRoleGuard(['Owner', 'Ads Manager', 'Social Media Manager', 'Manager']);
  
  const { user } = useAuth();
  const { adsMetrics, updateAdsMetrics } = useAdsData();
  
  const [dateRange, setDateRange] = useState('30d');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adsForm, setAdsForm] = useState({ spend: 0, leads: 0, clicks: 0, roas: 0 });

  // Memoized derived data
  const { filteredCampaigns, kpis, totalPlatformSpend } = useMemo(() => {
    const filtered = AD_CAMPAIGNS.filter(
      (c) => platformFilter === 'all' || c.platform === platformFilter
    );

    const kpiList = [
      { label: 'Total Spend',  value: `₹${adsMetrics.totalSpend.toLocaleString()}`,  icon: IndianRupee, color: 'text-violet-600 bg-violet-50', change: '+12%', up: true },
      { label: 'Total Leads',  value: adsMetrics.totalLeads.toLocaleString(),         icon: Users,      color: 'text-blue-600 bg-blue-50',    change: '+24%', up: true },
      { label: 'Total Clicks', value: adsMetrics.totalClicks.toLocaleString(),        icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', change: '+18%', up: true },
      { label: 'Avg ROAS',     value: `${adsMetrics.avgRoas}×`,                       icon: Target,     color: 'text-amber-600 bg-amber-50',  change: '-0.3×', up: false },
    ];

    const totalSpend = PLATFORM_BREAKDOWN.reduce((sum, item) => sum + item.spend, 0);

    return { filteredCampaigns: filtered, kpis: kpiList, totalPlatformSpend: totalSpend };
  }, [adsMetrics, platformFilter]);

  // Handlers
  const handleUpdateMetrics = () => {
    const newMetrics = {
      ...adsMetrics,
      totalSpend: adsMetrics.totalSpend + (adsForm.spend || 0),
      totalLeads: adsMetrics.totalLeads + (adsForm.leads || 0),
      totalClicks: adsMetrics.totalClicks + (adsForm.clicks || 0),
      avgRoas: adsForm.roas || adsMetrics.avgRoas,
      updatedAt: new Date().toISOString()
    };
    
    updateAdsMetrics(newMetrics);
    setIsModalOpen(false);
    toast.success('Ads performance data updated');
  };

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-violet-600" />
              Ads Tracking
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Cross-platform ad performance across all campaigns
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              >
                {DATE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Update Metrics Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-slate-800">Update Performance Data</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-medium text-slate-700">Add to Spend (₹)</label>
                    <input
                      type="number"
                      className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                      placeholder="0"
                      onChange={(e) => setAdsForm({ ...adsForm, spend: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-medium text-slate-700">Add to Leads</label>
                    <input
                      type="number"
                      className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                      placeholder="0"
                      onChange={(e) => setAdsForm({ ...adsForm, leads: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-medium text-slate-700">Add to Clicks</label>
                    <input
                      type="number"
                      className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                      placeholder="0"
                      onChange={(e) => setAdsForm({ ...adsForm, clicks: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-medium text-slate-700">Average ROAS (×)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                      placeholder={adsMetrics.avgRoas.toString()}
                      onChange={(e) => setAdsForm({ ...adsForm, roas: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <footer className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateMetrics}
                    className="px-4 py-2 text-[13px] font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm"
                  >
                    Update Metrics
                  </button>
                </footer>
              </div>
            </div>
          </div>
        )}

        {/* KPI Scorecard */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <Icon size={17} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-[11.5px] font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-[22px] font-bold text-slate-900 tabular-nums">{kpi.value}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{kpi.label}</p>
              </div>
            );
          })}
        </section>

        {/* Analytical Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Weekly Performance Trend */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13.5px] font-semibold text-slate-800 mb-4">Weekly Spend vs Leads</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="spend" name="Spend (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Platform Resource Allocation */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13.5px] font-semibold text-slate-800 mb-4">Platform Breakdown</h2>
            <div className="space-y-3">
              {PLATFORM_BREAKDOWN.map((p) => {
                const pct = totalPlatformSpend > 0 ? Math.round((p.spend / totalPlatformSpend) * 100) : 0;
                return (
                  <div key={p.platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12.5px] font-medium text-slate-700">{p.platform}</span>
                      <span className="text-[12px] text-slate-500 tabular-nums">₹{p.spend.toLocaleString()} · {p.leads} leads</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">{pct}% of total spend</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Engagement Trend */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
          <h2 className="text-[13.5px] font-semibold text-slate-800 mb-4">Click Trend</h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Granular Campaign Performance Table */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 size={15} className="text-violet-600" />
              Campaign Performance
            </h2>
            <nav className="flex gap-1.5">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${platformFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All
              </button>
              {['Meta', 'Google', 'Instagram', 'TikTok'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${platformFilter === p ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {p}
                </button>
              ))}
            </nav>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden md:table-cell">Platform</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Spend</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">Leads</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden lg:table-cell">Clicks</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">ROAS</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign, idx) => {
                  const spentPct = Math.round((campaign.spent / campaign.budget) * 100);
                  return (
                    <tr
                      key={campaign.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{campaign.name}</p>
                        <p className="text-[11px] text-slate-400">{campaign.client}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PLATFORM_STYLES[campaign.platform]}`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="font-semibold text-slate-800 tabular-nums">₹{campaign.spent.toLocaleString()}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${spentPct >= 90 ? 'bg-red-500' : spentPct >= 70 ? 'bg-amber-500' : 'bg-violet-500'}`}
                              style={{ width: `${Math.min(spentPct, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10.5px] text-slate-400 tabular-nums">{spentPct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-700 font-semibold tabular-nums hidden sm:table-cell">{campaign.leads}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600 tabular-nums hidden lg:table-cell">{campaign.clicks.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`font-bold tabular-nums ${campaign.roas >= 4 ? 'text-emerald-600' : campaign.roas >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
                          {campaign.roas}×
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[campaign.status]}`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
