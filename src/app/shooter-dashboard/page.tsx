'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Camera, CheckCircle2, Timer, Circle, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface ShooterTask {
  id: string;
  title: string;
  client: string;
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  workflowStage: number;
}

const shooterTasks: ShooterTask[] = [
  {
    id: 'st1',
    title: 'Shoot product photos for NovaBrew launch',
    client: 'Jordan Lee',
    campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-15',
    status: 'in_progress',
    priority: 'high',
    description: 'Capture 20+ product shots in studio setup. Include lifestyle and flat-lay compositions.',
    workflowStage: 1,
  },
  {
    id: 'st2',
    title: 'Shoot behind-the-scenes for LuxeHome',
    client: 'Mia Tanaka',
    campaign: 'LuxeHome Interior Series',
    deadline: '2026-04-22',
    status: 'pending',
    priority: 'medium',
    description: 'Document the interior styling process. Capture 3-4 rooms with natural lighting.',
    workflowStage: 1,
  },
  {
    id: 'st3',
    title: 'Shoot event coverage for GreenRoot',
    client: 'Ethan Patel',
    campaign: 'GreenRoot Awareness',
    deadline: '2026-04-12',
    status: 'completed',
    priority: 'medium',
    description: 'Cover the GreenRoot pop-up event. Capture crowd, products, and key moments.',
    workflowStage: 2,
  },
  {
    id: 'st4',
    title: 'Shoot PulseWear lifestyle content',
    client: 'Samantha Cruz',
    campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-28',
    status: 'pending',
    priority: 'low',
    description: 'Capture athletes wearing PulseWear gear in outdoor settings.',
    workflowStage: 1,
  },
];

const workflowStages = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

function isOverdue(deadline: string, status: TaskStatus) {
  return status !== 'completed' && new Date(deadline) < new Date();
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysLeft(deadline: string) {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function ShooterDashboardPage() {
  useRoleGuard(['Owner', 'Shooter']);
  const [tasks, setTasks] = useState<ShooterTask[]>(shooterTasks);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  function cycleStatus(id: string) {
    const order: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length] } : t
      )
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Camera size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Shooter Dashboard</h1>
            <p className="text-[13px] text-slate-500">Marco Reyes · Shooting Team</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Assigned', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className={`text-[24px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Workflow Stage Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Workflow Stage Overview</h2>
          <div className="flex items-center gap-1">
            {workflowStages.map((stage, idx) => {
              const isActive = idx === 0;
              const isDone = idx < 0;
              return (
                <React.Fragment key={stage}>
                  <div className={`flex-1 text-center`}>
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-blue-500' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-500 mt-3">Your role: <span className="font-semibold text-blue-700">Shooting</span> — complete your tasks to advance campaigns to the editing stage.</p>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <h2 className="text-[14px] font-semibold text-slate-800">Assigned Tasks</h2>
          {tasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            const overdue = isOverdue(task.deadline, task.status);
            const daysLeft = getDaysLeft(task.deadline);
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${overdue ? 'border-red-200' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-900 truncate">{task.title}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{task.client} · {task.campaign}</p>
                      <p className="text-[12px] text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => cycleStatus(task.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium whitespace-nowrap ${statusConfig[task.status].bg} ${statusConfig[task.status].color} transition-all hover:opacity-80`}
                  >
                    <StatusIcon size={13} />
                    {statusConfig[task.status].label}
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                    <Calendar size={12} />
                    {overdue ? 'Overdue · ' : ''}{formatDeadline(task.deadline)}
                    {!overdue && task.status !== 'completed' && (
                      <span className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        ({daysLeft > 0 ? `${daysLeft}d left` : 'Today'})
                      </span>
                    )}
                  </div>
                  {task.status === 'completed' && (
                    <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                      <ArrowRight size={12} />
                      Passed to Editor
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
