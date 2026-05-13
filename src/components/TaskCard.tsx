'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight, AlertCircle, X, ZoomIn, User } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { STATIC_STRINGS, TASK_STATUSES } from '@/utils/constants';
import { ROLE_CONFIG } from '@/utils/ui-configs';
import { isTaskOverdue, formatTaskDeadline, getTaskDaysLeft } from '@/utils/task-utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  showPerformer?: boolean;
}

export default function TaskCard({ task, onStatusChange, showPerformer = false }: TaskCardProps) {
  const overdue = isTaskOverdue(task.deadline, task.status);
  const daysLeft = getTaskDaysLeft(task.deadline);
  const currentStatus = (task.status || TASK_STATUSES.PENDING) as TaskStatus;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Status-based accent colors
  const statusAccents = {
    [TASK_STATUSES.COMPLETED]: 'bg-emerald-500',
    [TASK_STATUSES.IN_PROGRESS]: 'bg-blue-500',
    [TASK_STATUSES.PENDING]: 'bg-slate-300',
    overdue: 'bg-red-500',
  };

  const accentColor = overdue ? statusAccents.overdue : statusAccents[currentStatus] || statusAccents[TASK_STATUSES.PENDING];
  const roleInfo = ROLE_CONFIG[task.role] || { color: 'text-slate-600', bg: 'bg-slate-100', icon: User };
  const RoleIcon = roleInfo.icon;

  return (
    <>
      <article
        className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-200 hover:shadow-md overflow-hidden"
      >
        {/* Status Accent Line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <header>
              <h3 className="text-[15px] font-semibold text-slate-900 truncate">
                {task.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] text-slate-500">{task.client}</span>
                {task.brand && (
                  <>
                    <span className="text-slate-300 text-[10px]">/</span>
                    <span className="text-[12px] text-slate-500">{task.brand}</span>
                  </>
                )}
              </div>
              
              {showPerformer && task.performer_name && (
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mt-2.5 ${roleInfo.bg} ${roleInfo.color}`}>
                  <RoleIcon size={10} />
                  <span className="text-[11px] font-bold">{task.performer_name}</span>
                </div>
              )}
            </header>
          </div>

          <div className="flex items-center gap-3">
            {overdue && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{STATIC_STRINGS.TASK_MGMT_OVERDUE}</span>
              </div>
            )}
            
            <div className="relative">
              <select
                value={currentStatus}
                onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer outline-none border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}
              >
                <option value={TASK_STATUSES.PENDING}>{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING}</option>
                <option value={TASK_STATUSES.IN_PROGRESS}>{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS}</option>
                <option value={TASK_STATUSES.COMPLETED}>{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</option>
              </select>
              <ChevronRight
                className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400"
                size={14}
              />
            </div>
          </div>
        </div>

        {/* Team Notes Section */}
        {Array.isArray(task.roleNotes) && task.roleNotes.length > 0 && (
          <section className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              {STATIC_STRINGS.DASHBOARD_TEAM_NOTES}
            </p>
            
            <div className="space-y-4">
              {task.roleNotes.map((note: any, idx: number) => {
                const noteRoleInfo = ROLE_CONFIG[note.role] || { color: 'text-slate-600', bg: 'bg-slate-50' };
                return (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-100">
                    <header className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-800">
                          {note.name || note.role}
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${noteRoleInfo.color} ${noteRoleInfo.bg} px-1.5 py-0.5 rounded`}>
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

                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {note.note || note.message}
                    </p>

                    {note.screenshot && (
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(note.screenshot)}
                        className="mt-2.5 relative group/img block rounded-lg overflow-hidden border border-slate-200"
                      >
                        <img
                          className="h-20 w-32 object-cover transition-transform duration-300 group-hover/img:scale-110"
                          src={note.screenshot}
                          alt={STATIC_STRINGS.TASK_CARD_SCREENSHOT_ALT}
                        />
                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn size={16} className="text-white" />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-50">
          <div
            className={`flex items-center gap-2 text-[12px] font-medium ${overdue ? 'text-red-600' : 'text-slate-500'}`}
          >
            <Calendar size={13} />
            <span>{formatTaskDeadline(task.deadline)}</span>
            {!overdue && currentStatus !== TASK_STATUSES.COMPLETED && (
              <span className={`text-[11px] ${daysLeft <= 3 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                ({task.deadlineStatus ||
                  (daysLeft > 0
                    ? `${daysLeft} ${STATIC_STRINGS.DASHBOARD_DAYS_LEFT}`
                    : STATIC_STRINGS.DASHBOARD_TODAY)})
              </span>
            )}
          </div>
        </footer>
      </article>

      {/* Fullscreen image preview overlay */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:rotate-90"
          >
            <X size={22} className="text-white" />
          </button>

          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <img
              src={previewUrl}
              alt={STATIC_STRINGS.TASK_CARD_DELIVERY_ALT}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-white border-t flex justify-between items-center">
              <p className="text-sm font-semibold text-slate-700">Task Completion Proof</p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[12px] font-bold text-blue-600 hover:underline"
              >
                {STATIC_STRINGS.TASK_CARD_VIEW_PROOF}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
