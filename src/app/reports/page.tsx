'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, TrendingUp, DollarSign, Users, Target, Download, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { CampaignReport } from '@/types';
import { useAdsData } from '@/context/AdsDataContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { STATIC_STRINGS, PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';

const CAMPAIGN_REPORTS: CampaignReport[] = [
  { campaignId: 'c1', campaignName: 'NovaBrew Spring Launch', client: 'Jordan Lee', budget: 12000, spent: 9800, leads: 312, roas: 4.1, tasksTotal: 5, tasksCompleted: 3, stage: STATIC_STRINGS.DASHBOARD_STAGE_EDITING, startDate: '2026-03-01', endDate: '2026-04-30' },
  { campaignId: 'c2', campaignName: 'PulseWear Q2 Reel', client: 'Samantha Cruz', budget: 8500, spent: 8500, leads: 218, roas: 3.8, tasksTotal: 4, tasksCompleted: 4, stage: STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE, startDate: '2026-02-15', endDate: '2026-04-15' },
  { campaignId: 'c3', campaignName: 'GreenRoot Awareness', client: 'Ethan Patel', budget: 20000, spent: 11200, leads: 540, roas: 5.2, tasksTotal: 6, tasksCompleted: 4, stage: STATIC_STRINGS.DASHBOARD_STAGE_ADS, startDate: '2026-03-10', endDate: '2026-05-10' },
  { campaignId: 'c4', campaignName: 'LuxeHome Interior Series', client: 'Mia Tanaka', budget: 5000, spent: 1800, leads: 74, roas: 2.9, tasksTotal: 4, tasksCompleted: 1, stage: STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING, startDate: '2026-04-01', endDate: '2026-05-31' },
];

const MONTHLY_SPEND = [
  { month: 'Jan', spend: 4200, leads: 180 },
  { month: 'Feb', spend: 7800, leads: 290 },
  { month: 'Mar', spend: 12400, leads: 420 },
  { month: 'Apr', spend: 31300, leads: 1144 },
];

const STAGE_DISTRIBUTION = [
  { name: STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING, value: 1, color: '#6366f1' },
  { name: STATIC_STRINGS.DASHBOARD_STAGE_EDITING, value: 1, color: '#8b5cf6' },
  { name: STATIC_STRINGS.DASHBOARD_STAGE_ADS, value: 1, color: '#f59e0b' },
  { name: STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE, value: 1, color: '#10b981' },
];

const STAGE_BADGE_STYLE: Record<string, string> = {
  [STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING]: 'bg-blue-100 text-blue-700',
  [STATIC_STRINGS.DASHBOARD_STAGE_EDITING]: 'bg-purple-100 text-purple-700',
  [STATIC_STRINGS.DASHBOARD_STAGE_ADS]: 'bg-amber-100 text-amber-700',
  [STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE]: 'bg-emerald-100 text-emerald-700',
};

export default function ReportsPage() {
  useRoleGuard(PAGE_ROLES.REPORTS as unknown as UserRole[]);
  const { adsMetrics } = useAdsData();
  
  const [dateRange, setDateRange] = useState<string>('last_30');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const summaryStats = useMemo(() => {
    const totalSpend = adsMetrics?.totalSpend ?? 0;
    const totalLeads = adsMetrics?.totalLeads ?? 0;
    const avgRoas = (adsMetrics?.avgRoas ?? 0).toFixed(1);
    const totalBudget = CAMPAIGN_REPORTS.reduce((sum, campaign) => sum + campaign.budget, 0);

    return [
      { label: STATIC_STRINGS.REPORTS_TOTAL_BUDGET, value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
      { label: STATIC_STRINGS.REPORTS_TOTAL_SPENT, value: `$${totalSpend.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
      { label: STATIC_STRINGS.REPORTS_TOTAL_LEADS, value: totalLeads.toLocaleString(), icon: Users, color: 'text-emerald-600 bg-emerald-50' },
      { label: STATIC_STRINGS.REPORTS_AVG_ROAS, value: `${avgRoas}×`, icon: Target, color: 'text-amber-600 bg-amber-50' },
    ];
  }, [adsMetrics]);

  const handleExport = () => {
    toast.info('Export coming soon — reporting API integration required');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <main className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-violet-600" />
              {STATIC_STRINGS.REPORTS_TITLE}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {STATIC_STRINGS.REPORTS_SUBTITLE}
            </p>
          </div>
          <nav className="flex items-center gap-2">
            {/* <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none text-[13px] border border-slate-200 rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 bg-white text-slate-700 cursor-pointer"
                aria-label="Select date range"
              >
                <option value="last_7">{STATIC_STRINGS.REPORTS_DATE_RANGE_7}</option>
                <option value="last_30">{STATIC_STRINGS.REPORTS_DATE_RANGE_30}</option>
                <option value="last_90">{STATIC_STRINGS.REPORTS_DATE_RANGE_90}</option>
                <option value="all_time">{STATIC_STRINGS.REPORTS_DATE_RANGE_ALL}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div> */}
            {/* <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
            >
              <Download size={14} />
              {STATIC_STRINGS.REPORTS_EXPORT}
            </button> */}
          </nav>
        </header>


        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <article key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 tabular-nums leading-none">{s.value}</p>
                  <p className="text-[11.5px] text-slate-500 mt-1">{s.label}</p>
                </div>
              </article>
            );
          })}
        </section>

{/* 
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

          <article className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <header className="mb-4">
              <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.REPORTS_MONTHLY_CHART}</h2>
            </header>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_SPEND} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar yAxisId="left" dataKey="spend" name={STATIC_STRINGS.REPORTS_TOTAL_SPENT} fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="leads" name={STATIC_STRINGS.REPORTS_TOTAL_LEADS} fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>


          <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <header className="mb-2">
              <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.REPORTS_STAGE_CHART}</h2>
            </header>
            <div className="w-full h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STAGE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {STAGE_DISTRIBUTION.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <footer className="grid grid-cols-2 gap-1.5 mt-4">
              {STAGE_DISTRIBUTION.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-slate-500 font-medium">{s.name}</span>
                </div>
              ))}
            </footer>
          </article>
        </section>


        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <header className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.REPORTS_PERFORMANCE_TABLE}</h2>
          </header>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.CAMPAIGN_MGMT_TABLE_COL_NAME}</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px] hidden md:table-cell">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME}</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_BUDGET}</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px] hidden sm:table-cell">{STATIC_STRINGS.ADS_TABLE_COL_SPEND}</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px] hidden sm:table-cell">{STATIC_STRINGS.ADS_TABLE_COL_LEADS}</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.ADS_TABLE_COL_ROAS}</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px] hidden lg:table-cell">{STATIC_STRINGS.DASHBOARD_ASSIGNED_TASKS}</th>
                  <th className="text-left px-5 py-3 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">{STATIC_STRINGS.CAMPAIGN_FIELD_STAGE}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {CAMPAIGN_REPORTS.map((report) => {
                  const taskProgress = Math.round((report.tasksCompleted / report.tasksTotal) * 100);
                  return (
                    <tr key={report.campaignId} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-slate-800 truncate max-w-[180px] group-hover:text-violet-700 transition-colors">
                            {report.campaignName}
                          </p>
                          <p className="text-[11px] text-slate-400 md:hidden">{report.client}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium hidden md:table-cell">{report.client}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700 tabular-nums font-mono font-medium">
                        ${report.budget.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 tabular-nums font-mono hidden sm:table-cell">
                        ${report.spent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 tabular-nums font-mono hidden sm:table-cell">
                        {report.leads.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-bold font-mono tabular-nums text-[13px] ${
                          report.roas >= 4 ? 'text-emerald-600' : report.roas >= 3 ? 'text-slate-700' : 'text-red-500'
                        }`}>
                          {report.roas}×
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div
                              className="h-full bg-violet-500 rounded-full transition-all duration-500"
                              style={{ width: `${taskProgress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums w-8">
                            {report.tasksCompleted}/{report.tasksTotal}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-bold tracking-tight ${STAGE_BADGE_STYLE[report.stage] ?? 'bg-slate-100 text-slate-600'}`}>
                          {report.stage}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section> */}
      </main>
    </AppLayout>
  );
}
