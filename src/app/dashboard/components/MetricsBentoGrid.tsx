'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface MetricCard {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  variant: 'default' | 'warning' | 'danger' | 'success';
  span?: 'single' | 'double';
  mono?: boolean;
}

// BACKEND INTEGRATION: GET /api/dashboard/metrics → { activeCampaigns, tasksAtRisk, overdueTasks, adSpendMTD, leadsGenerated, avgROAS }
const metrics: MetricCard[] = [
  {
    id: 'metric-active-campaigns',
    label: 'Active Campaigns',
    value: '47',
    subValue: '12 launching this week',
    change: 6,
    changeLabel: 'vs last month',
    icon: Megaphone,
    variant: 'default',
    span: 'double',
  },
  {
    id: 'metric-tasks-at-risk',
    label: 'Tasks At Risk',
    value: '14',
    subValue: 'Within 24h deadline',
    change: -3,
    changeLabel: 'vs yesterday',
    icon: AlertTriangle,
    variant: 'warning',
  },
  {
    id: 'metric-overdue-tasks',
    label: 'Overdue Tasks',
    value: '6',
    subValue: '3 escalated',
    change: -2,
    changeLabel: 'vs last week',
    icon: Clock,
    variant: 'danger',
  },
  {
    id: 'metric-ad-spend',
    label: 'Ad Spend MTD',
    value: '$84,320',
    subValue: '$110K monthly budget',
    change: 12,
    changeLabel: 'vs last month',
    icon: DollarSign,
    variant: 'default',
    mono: true,
  },
  {
    id: 'metric-leads',
    label: 'Leads Generated',
    value: '3,847',
    subValue: 'Across all platforms',
    change: 18,
    changeLabel: 'vs last month',
    icon: Users,
    variant: 'success',
    mono: true,
  },
  {
    id: 'metric-roas',
    label: 'Avg ROAS',
    value: '4.2×',
    subValue: 'Target: 3.5×',
    change: 8,
    changeLabel: 'vs last month',
    icon: TrendingUp,
    variant: 'success',
    mono: true,
  },
];

const variantConfig = {
  default: {
    card: 'bg-white border-slate-200',
    icon: 'bg-violet-50 text-violet-600',
    label: 'text-slate-500',
    value: 'text-slate-900',
  },
  warning: {
    card: 'bg-amber-50 border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    label: 'text-amber-700',
    value: 'text-amber-900',
  },
  danger: {
    card: 'bg-red-50 border-red-200',
    icon: 'bg-red-100 text-red-600',
    label: 'text-red-700',
    value: 'text-red-900',
  },
  success: {
    card: 'bg-white border-slate-200',
    icon: 'bg-emerald-50 text-emerald-600',
    label: 'text-slate-500',
    value: 'text-slate-900',
  },
};

function ChangeIndicator({ change, label }: { change: number; label: string }) {
  if (change === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11.5px] text-slate-400">
        <Minus size={11} />
        No change {label}
      </span>
    );
  }
  const positive = change > 0;
  const Arrow = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`flex items-center gap-0.5 text-[11.5px] font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      <Arrow size={12} />
      {Math.abs(change)}% {label}
    </span>
  );
}

export default function MetricsBentoGrid() {
  // Grid plan: 6 cards → grid-cols-4 → row 1: hero spans 2 cols + 2 regular, row 2: 3 regular (last spans remaining)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mb-5">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const cfg = variantConfig[metric.variant];
        const isDouble = metric.span === 'double';

        return (
          <div
            key={metric.id}
            className={`relative rounded-xl border p-5 flex flex-col justify-between transition-shadow hover:shadow-md ${cfg.card} ${
              isDouble ? 'sm:col-span-2' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className={`text-[11.5px] font-semibold uppercase tracking-widest ${cfg.label}`}>
                  {metric.label}
                </p>
                {metric.variant === 'warning' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold">
                    <AlertTriangle size={9} /> Needs attention
                  </span>
                )}
                {metric.variant === 'danger' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-semibold">
                    ⚠ Escalation risk
                  </span>
                )}
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.icon}`}>
                <Icon size={17} />
              </div>
            </div>

            <div>
              <p className={`font-bold tabular-nums leading-none ${cfg.value} ${isDouble ? 'text-4xl' : 'text-3xl'} ${metric.mono ? 'font-mono' : ''}`}>
                {metric.value}
              </p>
              {metric.subValue && (
                <p className="text-[12px] text-slate-400 mt-1">{metric.subValue}</p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <ChangeIndicator change={metric.change} label={metric.changeLabel} />
            </div>
          </div>
        );
      })}
    </div>
  );
}