'use client';

import React, { useMemo } from 'react';
import { ChevronRight, AlertCircle, Video } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { STATIC_STRINGS } from '@/utils/constants';
import { REEL_STATUS_CONFIG, PRIORITY_STYLES } from '@/utils/ui-configs';
interface ReelCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

const checkIsOverdue = (deadline: string, status: TaskStatus) => {
  return status !== 'completed' && new Date(deadline) < new Date();
};

export default function ReelCard({ task, onStatusChange }: ReelCardProps) {
  const overdue = useMemo(() => 
    checkIsOverdue(task.deadline, task.status as TaskStatus),
  [task.deadline, task.status]);

  const config = useMemo(() => 
    REEL_STATUS_CONFIG[task.status] || REEL_STATUS_CONFIG.pending,
  [task.status]);

  return (
    <div 
      className={`group relative flex items-center gap-4 p-3.5 rounded-xl border transition-all hover:shadow-md ${
        task.status === 'completed' 
          ? 'bg-emerald-50/20 border-emerald-100/50' 
          : overdue 
            ? 'bg-white border-red-200 shadow-sm shadow-red-50' 
            : 'bg-white border-slate-100 hover:border-violet-200'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors'}`}>
        <Video size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLES[task.priority || 'medium']}`} />
          <h4 className="text-[14px] font-bold text-slate-900 truncate">{task.title}</h4>
        </div>
        <p className="text-[12px] text-slate-500 truncate font-medium">
          {task.clientName || STATIC_STRINGS.SMM_PRIVATE_CLIENT}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${config.bg} ${config.color}`}>
            <config.icon size={12} />
            {config.label}
          </div>
          {overdue && (
            <span className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> {STATIC_STRINGS.SMM_OVERDUE}
            </span>
          )}
        </div>

        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full text-[11px]"
          >
            <option value="pending">{STATIC_STRINGS.SMM_TAB_SCHEDULED}</option>
            <option value="in_progress">{STATIC_STRINGS.SMM_TAB_PRODUCTION}</option>
            <option value="completed">{STATIC_STRINGS.SMM_TAB_UPLOADED}</option>
          </select>
          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-violet-200 group-hover:text-violet-500 transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
