'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Wallet,
  Film,
  Timer,
  RefreshCw,
  UserPlus,
  Play,
  Briefcase,
  TrendingUp
} from 'lucide-react';

// --- Types ---
export interface MetricCardData {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  variant: 'default' | 'warning' | 'danger' | 'success';
  mono?: boolean;
}

interface MetricSectionProps {
  title: string;
  metrics: MetricCardData[];
  cols?: 1 | 2 | 3 | 4;
  action?: React.ReactNode;
}

const VARIANT_CONFIG = {
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
  
  const isPositive = change > 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  return (
    <span className={`flex items-center gap-0.5 text-[11.5px] font-medium ${isPositive ? 'text-emerald-600' : 'text-red-50'}`}>
      <TrendIcon size={12} />
      {Math.abs(change)}% {label}
    </span>
  );
}


export default function MetricSection({ title, metrics, cols = 4, action }: MetricSectionProps) {
  const gridCols = {
    1: 'lg:grid-cols-1',
    2: 'sm:grid-cols-2 lg:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="mb-6 last:mb-0">
      <header className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
        {action && <div>{action}</div>}
      </header>
      
      <div className={`grid grid-cols-1 ${gridCols[cols]} gap-4`}>
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;
          const styles = VARIANT_CONFIG[metric.variant];

          return (
            <article
              key={metric.id}
              className={`relative rounded-xl border p-5 flex flex-col justify-between transition-shadow hover:shadow-md ${styles.card}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <p className={`text-[11.5px] font-semibold uppercase tracking-widest ${styles.label}`}>
                    {metric.label}
                  </p>
                  {metric.variant === 'warning' && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold w-fit">
                      <AlertTriangle size={9} /> Needs attention
                    </span>
                  )}
                  {metric.variant === 'danger' && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-semibold w-fit">
                      ⚠ Escalation risk
                    </span>
                  )}
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
                  <MetricIcon size={17} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className={`font-bold tabular-nums leading-none ${styles.value} text-3xl ${metric.mono ? 'font-mono' : ''}`}>
                  {metric.value}
                </p>
                {metric.subValue && (
                  <p className="text-[12px] text-slate-400">{metric.subValue}</p>
                )}
              </div>

              {metric.change !== undefined && metric.changeLabel && (
                <footer className="mt-3 pt-3 border-t border-slate-100">
                  <ChangeIndicator change={metric.change} label={metric.changeLabel} />
                </footer>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const clientMetrics: MetricCardData[] = [
  { id: 'm-total-clients', label: 'Total Clients', value: '0', subValue: 'Active in workspace', icon: Briefcase, variant: 'default' },
];

export const revenueMetrics: MetricCardData[] = [
  { id: 'm-sales', label: 'Sales', value: '₹0', change: 0, changeLabel: 'vs last month', icon: Wallet, variant: 'default', mono: true },
  { id: 'm-collection', label: 'Collection', value: '₹0', subValue: '0% efficiency', icon: IndianRupee, variant: 'success', mono: true },
  { id: 'm-pending', label: 'Pending', value: '₹0', subValue: 'No invoices overdue', icon: Clock, variant: 'warning', mono: true },
];

export const reelsMetrics: MetricCardData[] = [
  { id: 'm-today-reels', label: "Today's Reels", value: '12', subValue: 'Scheduled for today', icon: Film, variant: 'default' },
  { id: 'm-reels-pending', label: 'Pending', value: '8', subValue: 'Awaiting raw files', icon: Timer, variant: 'warning' },
  { id: 'm-reels-processing', label: 'Processing', value: '4', subValue: 'In editing queue', icon: RefreshCw, variant: 'default' },
];

export const metaAdsMetrics: MetricCardData[] = [
  { id: 'm-ad-spend', label: 'Ad Spend MTD', value: '₹84,320', change: 12, changeLabel: 'vs last month', icon: IndianRupee, variant: 'default', mono: true },
  { id: 'm-leads-gen', label: 'Leads Generated', value: '3,847', change: 18, changeLabel: 'vs last month', icon: UserPlus, variant: 'success', mono: true },
  { id: 'm-avg-roas', label: 'Avg ROAS', value: '4.2×', subValue: 'Target: 3.5×', icon: TrendingUp, variant: 'success', mono: true },
  { id: 'm-active-camp', label: 'Active Campaigns', value: '47', subValue: '12 launching soon', icon: Play, variant: 'default' },
];

export const todoMetrics: MetricCardData[] = [
  { id: 'm-tasks-risk', label: 'Tasks At Risk', value: '14', subValue: 'Within 24h deadline', icon: AlertTriangle, variant: 'warning' },
  { id: 'm-overdue-tasks', label: 'Overdue Tasks', value: '6', subValue: '3 escalated', icon: Clock, variant: 'danger' },
];