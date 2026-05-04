'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, TooltipProps,
} from 'recharts';


interface LeadDataPoint {
  week: string;
  meta: number;
  google: number;
  total: number;
}

interface TaskDataPoint {
  week: string;
  shooting: number;
  editing: number;
  adsSetup: number;
  completed: number;
}

const LEADS_DATA: LeadDataPoint[] = [
  { week: 'Jan W1', meta: 210, google: 145, total: 355 },
  { week: 'Jan W2', meta: 285, google: 178, total: 463 },
  { week: 'Jan W3', meta: 320, google: 195, total: 515 },
  { week: 'Jan W4', meta: 270, google: 160, total: 430 },
  { week: 'Feb W1', meta: 390, google: 220, total: 610 },
  { week: 'Feb W2', meta: 340, google: 195, total: 535 },
  { week: 'Feb W3', meta: 420, google: 260, total: 680 },
  { week: 'Feb W4', meta: 380, google: 230, total: 610 },
  { week: 'Mar W1', meta: 460, google: 290, total: 750 },
  { week: 'Mar W2', meta: 510, google: 315, total: 825 },
  { week: 'Mar W3', meta: 445, google: 275, total: 720 },
  { week: 'Mar W4', meta: 580, google: 340, total: 920 },
];

const TASK_DATA: TaskDataPoint[] = [
  { week: 'Week 1', shooting: 8, editing: 6, adsSetup: 4, completed: 14 },
  { week: 'Week 2', shooting: 11, editing: 9, adsSetup: 6, completed: 19 },
  { week: 'Week 3', shooting: 7, editing: 11, adsSetup: 8, completed: 18 },
  { week: 'Week 4', shooting: 13, editing: 8, adsSetup: 5, completed: 22 },
  { week: 'Week 5', shooting: 9, editing: 13, adsSetup: 9, completed: 24 },
  { week: 'Week 6', shooting: 14, editing: 10, adsSetup: 7, completed: 21 },
  { week: 'Week 7', shooting: 10, editing: 14, adsSetup: 11, completed: 27 },
  { week: 'Week 8', shooting: 16, editing: 12, adsSetup: 8, completed: 29 },
];

const CustomLeadsTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-[12px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`tooltip-${p.dataKey}`} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500 capitalize">{p.name}</span>
          </span>
          <span className="font-semibold text-slate-800 tabular-nums font-mono">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};


const CustomTaskTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-[12px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={`task-tooltip-${p.dataKey}`} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </span>
          <span className="font-semibold text-slate-800 tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
};


export default function DashboardCharts() {
  const [leadsRange, setLeadsRange] = useState<'8w' | '12w'>('12w');
  
  const displayedLeads = useMemo(() => 
    leadsRange === '8w' ? LEADS_DATA.slice(4) : LEADS_DATA,
  [leadsRange]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      
      <section className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
        <header className="flex items-start justify-between mb-5 flex-shrink-0">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-800">Leads Generated</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Weekly performance across Meta & Google Ads</p>
          </div>
          <nav className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['8w', '12w'] as const).map((r) => (
              <button
                key={`range-${r}`}
                onClick={() => setLeadsRange(r)}
                className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-all ${
                  leadsRange === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={displayedLeads} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6C47FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="googleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomLeadsTooltip />} />
              <Area
                type="monotone"
                dataKey="meta"
                name="Meta"
                stroke="#6C47FF"
                strokeWidth={2}
                fill="url(#metaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#6C47FF' }}
              />
              <Area
                type="monotone"
                dataKey="google"
                name="Google"
                stroke="#FF6B35"
                strokeWidth={2}
                fill="url(#googleGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#FF6B35' }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                formatter={(v) => <span className="text-[11.5px] text-slate-500 capitalize">{v}</span>}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bar Chart: Workflow Efficiency by Stage */}
      <section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
        <header className="mb-5 flex-shrink-0">
          <h3 className="text-[14px] font-semibold text-slate-800">Task Completion by Stage</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Weekly tasks completed per workflow role</p>
        </header>

        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TASK_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTaskTooltip />} />
              <Bar dataKey="shooting" name="Shooting" stackId="a" fill="#6C47FF" />
              <Bar dataKey="editing" name="Editing" stackId="a" fill="#8B6FFF" />
              <Bar dataKey="adsSetup" name="Ads Setup" stackId="a" fill="#FF6B35" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <footer className="flex items-center gap-3 mt-4 flex-wrap flex-shrink-0">
          {[
            { label: 'Shooting', color: '#6C47FF' },
            { label: 'Editing', color: '#8B6FFF' },
            { label: 'Ads Setup', color: '#FF6B35' },
          ].map((l) => (
            <span key={`legend-${l.label}`} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </footer>
      </section>
    </div>
  );
}