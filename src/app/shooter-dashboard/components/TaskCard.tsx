'use client';

import React from 'react';
import { Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { STATIC_STRINGS } from '@/utils/constants';
import { STATUS_CONFIG } from '@/utils/ui-configs';
import { isTaskOverdue, formatTaskDeadline, getTaskDaysLeft } from '@/utils/task-utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const overdue = isTaskOverdue(task.deadline, task.status);
  const daysLeft = getTaskDaysLeft(task.deadline);
  const currentStatus = (task.status || 'pending') as TaskStatus;

  return (
    <article
      className={`rounded-xl border shadow-sm p-4 transition-all ${
        currentStatus === 'completed'
          ? 'bg-emerald-50/30 border-emerald-100'
          : overdue
          ? 'bg-white border-red-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-slate-900 truncate">{task.title}</p>
            <p className="text-[12px] text-slate-500 mt-0.5">{task.client}</p>
          </div>
        </div>
        <div className="relative">
          {overdue && (
            <AlertCircle
              size={14}
              className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2"
            />
          )}
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${
              (STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending).bg
            } ${(STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending).color} hover:opacity-80`}
          >
            <option value="pending">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING}</option>
            <option value="in_progress">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS}</option>
            <option value="completed">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</option>
          </select>
          <ChevronRight
            className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400"
            size={12}
          />
        </div>
      </div>

      {/* Role-Specific Collaborative Notes */}
      {Array.isArray(task.roleNotes) && task.roleNotes.length > 0 && (
        <section className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {STATIC_STRINGS.DASHBOARD_TEAM_NOTES}
          </p>
          {task.roleNotes.map((note: any, idx: number) => (
            <div key={idx} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100/50">
              <header className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold">
                      {(note.role || 'S').charAt(0)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {note.name || note.role}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                    {note.role}
                  </span>
                </div>
                <time className="text-[10px] text-slate-400 font-medium">
                  {new Date(note.created_at || note.timestamp || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </header>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                {note.note || note.message}
              </p>
              {note.screenshot && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={note.screenshot}
                    alt="Task Proof"
                    className="w-full h-auto max-h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div
          className={`flex items-center gap-1.5 text-[12px] ${
            overdue ? 'text-red-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Calendar size={12} />
          {overdue ? STATIC_STRINGS.DASHBOARD_OVERDUE_LABEL : ''}
          {formatTaskDeadline(task.deadline)}
          {!overdue && task.status !== 'completed' && (
            <span
              className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}
            >
              ({task.deadlineStatus ||
                (daysLeft > 0
                  ? `${daysLeft}${STATIC_STRINGS.DASHBOARD_DAYS_LEFT}`
                  : STATIC_STRINGS.DASHBOARD_TODAY)})
            </span>
          )}
          {task.status === 'completed' && task.deadlineStatus && (
            <span className="ml-1 text-slate-400 font-medium">({task.deadlineStatus})</span>
          )}
        </div>
      </footer>
    </article>
  );
}
