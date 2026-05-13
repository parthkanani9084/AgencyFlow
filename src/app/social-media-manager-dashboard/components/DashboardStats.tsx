'use client';

import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Timer, CheckCircle2 } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';

interface DashboardStatsProps {
  stats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statsItems = useMemo(() => [
    {
      label: STATIC_STRINGS.SMM_STAT_UPCOMING,
      value: stats.pending,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: CalendarIcon,
    },
    {
      label: STATIC_STRINGS.SMM_STAT_PRODUCTION,
      value: stats.inProgress,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: Timer,
    },
    {
      label: STATIC_STRINGS.SMM_STAT_UPLOADED,
      value: stats.completed,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: CheckCircle2,
    },
  ], [stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statsItems.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
        >
          <div
            className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}
          >
            <item.icon size={20} />
          </div>

          <div>
            <p className="text-[20px] font-black text-slate-900 leading-none">{item.value}</p>

            <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
