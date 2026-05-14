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
import { STATIC_STRINGS } from '@/utils/constants';

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
        {STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS.includes('No tasks') ? STATIC_STRINGS.DASHBOARD_INDICATOR_NO_CHANGE : STATIC_STRINGS.DASHBOARD_INDICATOR_STEADY} {label}
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
                      <AlertTriangle size={9} /> {STATIC_STRINGS.DASHBOARD_METRIC_NEEDS_ATTENTION}
                    </span>
                  )}
                  {metric.variant === 'danger' && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-semibold w-fit">
                      ⚠ {STATIC_STRINGS.DASHBOARD_METRIC_ESCALATION_RISK}
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
  { id: 'm-total-clients', label: STATIC_STRINGS.DASHBOARD_METRIC_TOTAL_CLIENTS, value: '0', subValue: STATIC_STRINGS.DASHBOARD_METRIC_ACTIVE_WORKSPACE, icon: Briefcase, variant: 'default' },
];

export const revenueMetrics: MetricCardData[] = [
  { id: 'm-sales', label: STATIC_STRINGS.DASHBOARD_METRIC_SALES, value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`, change: 0, changeLabel: STATIC_STRINGS.DASHBOARD_METRIC_VS_PREV, icon: Wallet, variant: 'default', mono: true },
  { id: 'm-collection', label: STATIC_STRINGS.DASHBOARD_METRIC_COLLECTION, value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`, subValue: `0% ${STATIC_STRINGS.DASHBOARD_METRIC_EFFICIENCY}`, icon: IndianRupee, variant: 'success', mono: true },
  { id: 'm-pending', label: STATIC_STRINGS.DASHBOARD_METRIC_PENDING, value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`, subValue: STATIC_STRINGS.DASHBOARD_METRIC_NO_OVERDUE, icon: Clock, variant: 'warning', mono: true },
];

export const reelsMetrics: MetricCardData[] = [
  { id: 'm-today-reels', label: STATIC_STRINGS.DASHBOARD_METRIC_TODAY_REELS, value: '0', subValue: STATIC_STRINGS.DASHBOARD_METRIC_SCHEDULED_TODAY, icon: Film, variant: 'default' },
  { id: 'm-reels-pending', label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING, value: '0', subValue: STATIC_STRINGS.DASHBOARD_METRIC_AWAITING_RAW, icon: Timer, variant: 'warning' },
  { id: 'm-reels-processing', label: STATIC_STRINGS.DASHBOARD_METRIC_PROCESSING, value: '0', subValue: STATIC_STRINGS.DASHBOARD_METRIC_EDITING_QUEUE, icon: RefreshCw, variant: 'default' },
];

export const metaAdsMetrics: MetricCardData[] = [
  { id: 'm-ad-spend', label: STATIC_STRINGS.DASHBOARD_METRIC_AD_SPEND_MTD, value: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`, icon: IndianRupee, variant: 'default', mono: true },
  { id: 'm-leads-gen', label: STATIC_STRINGS.ADS_TABLE_COL_LEADS, value: '0', icon: UserPlus, variant: 'success', mono: true },
  { id: 'm-avg-roas', label: STATIC_STRINGS.ADS_TABLE_COL_ROAS, value: '0×', icon: TrendingUp, variant: 'success', mono: true },
  { id: 'm-active-camp', label: STATIC_STRINGS.ADS_DASHBOARD_STAT_ACTIVE_CAMPAIGNS, value: '0', icon: Play, variant: 'default' },
];

export const todoMetrics: MetricCardData[] = [
  { id: 'm-tasks-risk', label: STATIC_STRINGS.DASHBOARD_METRIC_TASKS_AT_RISK, value: '0', subValue: STATIC_STRINGS.DASHBOARD_METRIC_NEAR_DEADLINE, icon: AlertTriangle, variant: 'warning' },
  { id: 'm-overdue-tasks', label: STATIC_STRINGS.DASHBOARD_METRIC_OVERDUE_TASKS, value: '0', subValue: `0 ${STATIC_STRINGS.DASHBOARD_METRIC_ESCALATED}`, icon: Clock, variant: 'danger' },
];