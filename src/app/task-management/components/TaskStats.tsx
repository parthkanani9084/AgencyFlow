import React from 'react';
import { CheckSquare, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';
import { TaskStats as ITaskStats } from '../types';

interface TaskStatsProps {
  stats: ITaskStats;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const statConfig = [
    { label: STATIC_STRINGS.TASK_MGMT_TOTAL_TASKS, value: stats.total, icon: CheckSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: STATIC_STRINGS.TASK_MGMT_IN_PROGRESS, value: stats.inProgress, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: STATIC_STRINGS.TASK_MGMT_COMPLETED, value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: STATIC_STRINGS.TASK_MGMT_OVERDUE, value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {statConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={17} className={stat.color} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900 leading-none">{stat.value}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStats;
