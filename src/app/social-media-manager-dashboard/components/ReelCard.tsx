'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, Circle, Timer, ChevronRight, AlertCircle, Video } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types';

interface ReelCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Scheduled', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'Production', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Uploaded', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

const checkIsOverdue = (deadline: string, status: TaskStatus) => {
  return status !== 'completed' && new Date(deadline) < new Date();
};

export default function ReelCard({ task, onStatusChange }: ReelCardProps) {
  const overdue = useMemo(() => 
    checkIsOverdue(task.deadline, task.status as TaskStatus),
  [task.deadline, task.status]);

  const config = useMemo(() => 
    statusConfig[task.status] || statusConfig.pending,
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
          <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority]}`} />
          <h4 className="text-[14px] font-bold text-slate-900 truncate">{task.title}</h4>
        </div>
        <p className="text-[12px] text-slate-500 truncate font-medium">
          {task.clientName || 'Private Client'}
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
              <AlertCircle size={10} /> Overdue
            </span>
          )}
        </div>

        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          >
            <option value="pending">Scheduled</option>
            <option value="in_progress">Production</option>
            <option value="completed">Uploaded</option>
          </select>
          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-violet-200 group-hover:text-violet-500 transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
