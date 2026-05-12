'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight, AlertCircle, X, ZoomIn } from 'lucide-react';
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


  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <>
      <article
        className={`rounded-xl border shadow-sm p-4 transition-all ${currentStatus === 'completed'
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
        <div className='flex gap-3 items-center'>
                <p className="text-[12px] text-slate-500 mt-0.5">{task.client}</p> . <p className="text-[12px] text-slate-500 mt-0.5">{task.brand}</p>
        </div>
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
              className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${(STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending).bg
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

        {/* Team Notes */}
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

                {
                  console.log("note.screenshot", note.screenshot)
                }

                {note.screenshot && (
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(note.screenshot)}
                    className="mt-2 relative group inline-block rounded-lg overflow-hidden border border-slate-200"
                  >
         
      

                    <img
                      className="h-20 w-28 object-cover"
                      src={note.screenshot}
                      onError={() => console.log("image failed")}
                      onLoad={() => console.log("loaded")}
                    />
                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={16} className="text-white" />
                    </div>
                  </button>
                )}
              </div>
            ))}
          </section>
        )}

        <footer className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <div
            className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'
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

      {/* Fullscreen image preview overlay */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white" />
          </button>

          <img
            src={previewUrl}
            alt="Delivery Screenshot"
            style={{ width: "300px", borderRadius: "8px" }}
          />
        </div>
      )}
    </>
  );
}
