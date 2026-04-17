'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Megaphone, CheckCircle2, Timer, Circle, Calendar, ChevronRight, TrendingUp, DollarSign } from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface AdsTask {
  id: string;
  title: string;
  client: string;
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  platform: string;
  budget: number;
  spent: number;
  leads: number;
}

const adsTasks: AdsTask[] = [
  {
    id: 'at1',
    title: 'Run Meta ads for GreenRoot campaign',
    client: 'Ethan Patel',
    campaign: 'GreenRoot Awareness',
    deadline: '2026-04-20',
    status: 'in_progress',
    priority: 'medium',
    description: 'Set up and launch Meta ad sets. Budget: $2,000. Target: eco-conscious 25-40 demographic.',
    platform: 'Meta',
    budget: 2000,
    spent: 840,
    leads: 62,
  },
  {
    id: 'at2',
    title: 'Launch Google Ads for PulseWear',
    client: 'Samantha Cruz',
    campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-28',
    status: 'completed',
    priority: 'low',
    description: 'Set up search and display campaigns. Track conversions via GA4.',
    platform: 'Google',
    budget: 1500,
    spent: 1500,
    leads: 118,
  },
  {
    id: 'at3',
    title: 'Launch NovaBrew Instagram campaign',
    client: 'Jordan Lee',
    campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-30',
    status: 'pending',
    priority: 'high',
    description: 'Run Instagram story and feed ads targeting coffee enthusiasts aged 22-35.',
    platform: 'Meta',
    budget: 3000,
    spent: 0,
    leads: 0,
  },
  {
    id: 'at4',
    title: 'Set up LuxeHome Pinterest ads',
    client: 'Mia Tanaka',
    campaign: 'LuxeHome Interior Series',
    deadline: '2026-05-05',
    status: 'pending',
    priority: 'medium',
    description: 'Create Pinterest promoted pins targeting home decor enthusiasts.',
    platform: 'Pinterest',
    budget: 1200,
    spent: 0,
    leads: 0,
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

const platformColors: Record<string, { color: string; bg: string }> = {
  Meta: { color: 'text-blue-700', bg: 'bg-blue-100' },
  Google: { color: 'text-red-700', bg: 'bg-red-100' },
  Pinterest: { color: 'text-pink-700', bg: 'bg-pink-100' },
};

function isOverdue(deadline: string, status: TaskStatus) {
  return status !== 'completed' && new Date(deadline) < new Date();
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export default function AdsManagerDashboardPage() {
  const [tasks, setTasks] = useState<AdsTask[]>(adsTasks);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  const totalSpent = tasks.reduce((sum, t) => sum + t.spent, 0);
  const totalLeads = tasks.reduce((sum, t) => sum + t.leads, 0);

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
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Ads Manager Dashboard</h1>
            <p className="text-[13px] text-slate-500">Sofia Nguyen · Ads Team</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Campaigns', value: stats.total, color: 'text-orange-600', bg: 'bg-orange-50' },
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

        {/* Ad Performance Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
              <p className="text-[12px] text-slate-500">Total Ad Spend</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp size={17} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900">{totalLeads}</p>
              <p className="text-[12px] text-slate-500">Total Leads Generated</p>
            </div>
          </div>
        </div>

        {/* Workflow Stage Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Workflow Stage Overview</h2>
          <div className="flex items-center gap-1">
            {workflowStages.map((stage, idx) => {
              const isActive = idx === 3;
              const isDone = idx < 3;
              return (
                <React.Fragment key={stage}>
                  <div className="flex-1 text-center">
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-orange-500' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-orange-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-500 mt-3">Your role: <span className="font-semibold text-orange-700">Ads</span> — run campaigns and input performance data to complete the workflow.</p>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <h2 className="text-[14px] font-semibold text-slate-800">Assigned Campaigns</h2>
          {tasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            const overdue = isOverdue(task.deadline, task.status);
            const daysLeft = getDaysLeft(task.deadline);
            const platform = platformColors[task.platform] ?? { color: 'text-slate-700', bg: 'bg-slate-100' };
            const spendPct = task.budget > 0 ? Math.min(100, Math.round((task.spent / task.budget) * 100)) : 0;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${overdue ? 'border-red-200' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-slate-900">{task.title}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${platform.bg} ${platform.color}`}>{task.platform}</span>
                      </div>
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

                {/* Budget Progress */}
                {task.budget > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500">Budget: ${task.budget.toLocaleString()}</span>
                      <span className="text-[11px] font-medium text-slate-700">${task.spent.toLocaleString()} spent · {task.leads} leads</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${spendPct >= 90 ? 'bg-red-500' : spendPct >= 60 ? 'bg-amber-400' : 'bg-orange-400'}`}
                        style={{ width: `${spendPct}%` }}
                      />
                    </div>
                  </div>
                )}

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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
