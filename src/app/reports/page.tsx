'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, TrendingUp, DollarSign, Users, Target, Download, ChevronDown } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { CampaignReport } from '@/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAdsData } from '@/context/AdsDataContext';

// ─── Mock report data ─────────────────────────────────────────────────────────
const campaignReports: CampaignReport[] = [
  { campaignId: 'c1', campaignName: 'NovaBrew Spring Launch',   client: 'Jordan Lee',    budget: 12000, spent: 9800,  leads: 312, roas: 4.1, tasksTotal: 5, tasksCompleted: 3, stage: 'Editing',  startDate: '2026-03-01', endDate: '2026-04-30' },
  { campaignId: 'c2', campaignName: 'PulseWear Q2 Reel',        client: 'Samantha Cruz', budget: 8500,  spent: 8500,  leads: 218, roas: 3.8, tasksTotal: 4, tasksCompleted: 4, stage: 'Complete', startDate: '2026-02-15', endDate: '2026-04-15' },
  { campaignId: 'c3', campaignName: 'GreenRoot Awareness',      client: 'Ethan Patel',   budget: 20000, spent: 11200, leads: 540, roas: 5.2, tasksTotal: 6, tasksCompleted: 4, stage: 'Ads',      startDate: '2026-03-10', endDate: '2026-05-10' },
  { campaignId: 'c4', campaignName: 'LuxeHome Interior Series', client: 'Mia Tanaka',    budget: 5000,  spent: 1800,  leads: 74,  roas: 2.9, tasksTotal: 4, tasksCompleted: 1, stage: 'Shooting', startDate: '2026-04-01', endDate: '2026-05-31' },
];

const monthlySpend = [
  { month: 'Jan', spend: 4200, leads: 180 },
  { month: 'Feb', spend: 7800, leads: 290 },
  { month: 'Mar', spend: 12400, leads: 420 },
  { month: 'Apr', spend: 31300, leads: 1144 },
];

const stageDistribution = [
  { name: 'Shooting',  value: 1, color: '#6366f1' },
  { name: 'Editing',   value: 1, color: '#8b5cf6' },
  { name: 'Ads',       value: 1, color: '#f59e0b' },
  { name: 'Complete',  value: 1, color: '#10b981' },
];

const stageBadge: Record<string, string> = {
  Shooting: 'bg-blue-100 text-blue-700',
  'Raw Upload': 'bg-slate-100 text-slate-600',
  Editing: 'bg-purple-100 text-purple-700',
  Ads: 'bg-amber-100 text-amber-700',
  Complete: 'bg-emerald-100 text-emerald-700',
};

export default function ReportsPage() {
  useRoleGuard(['Owner', 'Manager']);
  const [dateRange, setDateRange] = useState<string>('last_30');
  const { adsMetrics } = useAdsData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSpend = adsMetrics?.totalSpend ?? 0;
  const totalLeads = adsMetrics?.totalLeads ?? 0;
  const avgRoas = (adsMetrics?.avgRoas ?? 0).toFixed(1);
  const totalBudget = campaignReports.reduce((s, c) => s + c.budget, 0);

  const summaryStats = [
    { label: 'Total Budget',   value: `$${totalBudget.toLocaleString()}`,  icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
    { label: 'Total Spent',    value: `$${totalSpend.toLocaleString()}`,  icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Leads',    value: totalLeads.toLocaleString(),    icon: Users,      color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Avg ROAS',       value: `${avgRoas}×`,     icon: Target,     color: 'text-amber-600 bg-amber-50' },
  ];

  function handleExport() {
    toast.info('Export coming soon — reporting API required');
  }

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-600" />
              Reports
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Campaign performance overview across all clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none text-[13px] border border-slate-200 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white text-slate-700"
              >
                <option value="last_7">Last 7 days</option>
                <option value="last_30">Last 30 days</option>
                <option value="last_90">Last 90 days</option>
                <option value="all_time">All time</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 tabular-nums">{s.value}</p>
                  <p className="text-[11.5px] text-slate-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
          {/* Monthly spend + leads */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Monthly Spend & Leads</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySpend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="spend" name="Spend ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stage distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Campaign Stages</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stageDistribution.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {stageDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[11.5px] text-slate-600">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-800">Campaign Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold">Campaign</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden md:table-cell">Client</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold">Budget</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold hidden sm:table-cell">Spent</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold hidden sm:table-cell">Leads</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold">ROAS</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden lg:table-cell">Tasks</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody>
                {campaignReports.map((r, i) => {
                  const pct = Math.round((r.tasksCompleted / r.tasksTotal) * 100);
                  return (
                    <tr key={r.campaignId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]">{r.campaignName}</p>
                        <p className="text-[11px] text-slate-400 md:hidden">{r.client}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{r.client}</td>
                      <td className="px-4 py-3 text-right text-slate-700 tabular-nums font-medium">
                        ${r.budget.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums hidden sm:table-cell">
                        ${r.spent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums hidden sm:table-cell">
                        {r.leads.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold tabular-nums ${r.roas >= 4 ? 'text-emerald-600' : r.roas >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
                          {r.roas}×
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 tabular-nums">{r.tasksCompleted}/{r.tasksTotal}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${stageBadge[r.stage] ?? 'bg-slate-100 text-slate-600'}`}>
                          {r.stage}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
