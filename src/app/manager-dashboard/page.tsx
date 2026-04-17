'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, CheckCircle2, Timer, Circle, Calendar, ChevronRight, Camera, Film, Megaphone, AlertCircle } from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskRole = 'Shooter' | 'Editor' | 'Ads Manager';

interface ManagedTask {
  id: string;
  title: string;
  assignedTo: string;
  role: TaskRole;
  client: string;
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
}

const allTasks: ManagedTask[] = [
  { id: 'mt1', title: 'Shoot product photos for NovaBrew launch', assignedTo: 'Marco Reyes', role: 'Shooter', client: 'Jordan Lee', campaign: 'NovaBrew Spring Launch', deadline: '2026-04-15', status: 'in_progress', priority: 'high' },
  { id: 'mt2', title: 'Edit raw footage for PulseWear reel', assignedTo: 'Jin Park', role: 'Editor', client: 'Samantha Cruz', campaign: 'PulseWear Q2 Reel', deadline: '2026-04-18', status: 'pending', priority: 'high' },
  { id: 'mt3', title: 'Run Meta ads for GreenRoot campaign', assignedTo: 'Sofia Nguyen', role: 'Ads Manager', client: 'Ethan Patel', campaign: 'GreenRoot Awareness', deadline: '2026-04-20', status: 'in_progress', priority: 'medium' },
  { id: 'mt4', title: 'Shoot behind-the-scenes for LuxeHome', assignedTo: 'Marco Reyes', role: 'Shooter', client: 'Mia Tanaka', campaign: 'LuxeHome Interior Series', deadline: '2026-04-22', status: 'pending', priority: 'medium' },
  { id: 'mt5', title: 'Edit NovaBrew promo video', assignedTo: 'Jin Park', role: 'Editor', client: 'Jordan Lee', campaign: 'NovaBrew Spring Launch', deadline: '2026-04-25', status: 'pending', priority: 'high' },
  { id: 'mt6', title: 'Launch Google Ads for PulseWear', assignedTo: 'Sofia Nguyen', role: 'Ads Manager', client: 'Samantha Cruz', campaign: 'PulseWear Q2 Reel', deadline: '2026-04-28', status: 'completed', priority: 'low' },
  { id: 'mt7', title: 'Shoot event coverage for GreenRoot', assignedTo: 'Marco Reyes', role: 'Shooter', client: 'Ethan Patel', campaign: 'GreenRoot Awareness', deadline: '2026-04-12', status: 'completed', priority: 'medium' },
  { id: 'mt8', title: 'Edit LuxeHome showcase reel', assignedTo: 'Jin Park', role: 'Editor', client: 'Mia Tanaka', campaign: 'LuxeHome Interior Series', deadline: '2026-04-30', status: 'pending', priority: 'low' },
];

const workflowStages = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

const roleConfig: Record<TaskRole, { color: string; bg: string; icon: React.ElementType }> = {
  Shooter: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  Editor: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  'Ads Manager': { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
};

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
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

const roleFilters: { label: string; value: TaskRole | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Shooter', value: 'Shooter' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Ads Manager', value: 'Ads Manager' },
];

export default function ManagerDashboardPage() {
  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');

  const filtered = allTasks.filter((t) => roleFilter === 'all' || t.role === roleFilter);

  const stats = {
    total: allTasks.length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    overdue: allTasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  const teamMembers = [
    { name: 'Marco Reyes', role: 'Shooter', tasks: allTasks.filter((t) => t.assignedTo === 'Marco Reyes'), color: 'bg-blue-600' },
    { name: 'Jin Park', role: 'Editor', tasks: allTasks.filter((t) => t.assignedTo === 'Jin Park'), color: 'bg-purple-600' },
    { name: 'Sofia Nguyen', role: 'Ads Manager', tasks: allTasks.filter((t) => t.assignedTo === 'Sofia Nguyen'), color: 'bg-orange-600' },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <Users size={20} className="text-teal-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Manager Dashboard</h1>
            <p className="text-[13px] text-slate-500">Priya Sharma · Management</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'text-teal-600', bg: 'bg-teal-50' },
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

        {/* Team Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Team Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            {teamMembers.map((member) => {
              const done = member.tasks.filter((t) => t.status === 'completed').length;
              const pct = member.tasks.length > 0 ? Math.round((done / member.tasks.length) * 100) : 0;
              return (
                <div key={member.name} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full ${member.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-[10px] font-bold text-white">{member.name.split(' ').map((n) => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-800">{member.name}</p>
                      <p className="text-[11px] text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-500">{done}/{member.tasks.length} done</span>
                    <span className="text-[11px] font-semibold text-slate-700">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${member.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Stage Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Active Workflow Stages</h2>
          <div className="flex items-center gap-1">
            {workflowStages.map((stage, idx) => {
              const stageTaskMap: Record<string, TaskRole[]> = {
                Shooting: ['Shooter'],
                'Raw Upload': ['Shooter'],
                Editing: ['Editor'],
                Ads: ['Ads Manager'],
                Complete: [],
              };
              const stageTasks = allTasks.filter((t) => stageTaskMap[stage]?.includes(t.role));
              const activeTasks = stageTasks.filter((t) => t.status === 'in_progress').length;
              const isActive = activeTasks > 0;
              return (
                <React.Fragment key={stage}>
                  <div className="flex-1 text-center">
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>{stage}</span>
                    {isActive && <p className="text-[10px] text-teal-500 mt-0.5">{activeTasks} active</p>}
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Task List with Role Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-slate-800">All Tasks</h2>
            <div className="flex gap-1">
              {roleFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRoleFilter(f.value)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
                    roleFilter === f.value
                      ? 'bg-teal-600 text-white' :'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            {filtered.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              const RoleIcon = roleConfig[task.role].icon;
              const overdue = isOverdue(task.deadline, task.status);
              const daysLeft = getDaysLeft(task.deadline);
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 ${overdue ? 'border-red-200' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${roleConfig[task.role].bg} ${roleConfig[task.role].color}`}>
                            <RoleIcon size={10} />
                            {task.assignedTo}
                          </span>
                          <span className="text-[11px] text-slate-400">{task.client} · {task.campaign}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {overdue && <AlertCircle size={14} className="text-red-500" />}
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium ${statusConfig[task.status].bg} ${statusConfig[task.status].color}`}>
                        <StatusIcon size={12} />
                        {statusConfig[task.status].label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
                    <Calendar size={11} className={overdue ? 'text-red-500' : 'text-slate-400'} />
                    <span className={`text-[11.5px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      {overdue ? 'Overdue · ' : ''}{formatDeadline(task.deadline)}
                    </span>
                    {!overdue && task.status !== 'completed' && (
                      <span className={`text-[11px] ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                        ({daysLeft > 0 ? `${daysLeft}d left` : 'Today'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
