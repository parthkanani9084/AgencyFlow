'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, CheckCircle2, Timer, Circle, Calendar, ChevronRight, Camera, Film, Megaphone, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority, TaskRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';

interface ManagedTask extends Task {}

const workflowStages = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

const roleConfig: Record<TaskRole | string, { color: string; bg: string; icon: React.ElementType }> = {
  Shooter: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  Editor: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  'Ads Manager': { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

function isOverdue(deadline: string, status: string) {
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
  useRoleGuard(['Owner', 'Manager']);
  const { tasks: allTasks, updateTask } = useTasks();
  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = allTasks.filter((t) => roleFilter === 'all' || t.role === roleFilter);

  const stats = {
    total: allTasks.length,
    inProgress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
    overdue: allTasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  const teamMembers = [
    { id: 'tm1', name: 'Marco Reyes', role: 'Shooter', color: 'bg-blue-600' },
    { id: 'tm2', name: 'Jin Park', role: 'Editor', color: 'bg-purple-600' },
    { id: 'tm3', name: 'Sofia Nguyen', role: 'Ads Manager', color: 'bg-orange-600' },
    { id: 'tm4', name: 'Amara Diallo', role: 'Editor', color: 'bg-purple-600' },
    { id: 'tm5', name: 'Priya Sharma', role: 'Manager', color: 'bg-teal-600' },
    { id: 'tm6', name: 'Alex Rivera', role: 'Owner', color: 'bg-violet-600' },
  ];

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setIsModalOpen(true);
    } else {
      updateTask(task.id, { status: newStatus });
    }
  };

  const onCompleteTask = (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string) => {
    updateTask(taskId, { status: 'completed' }, notes, nextMember, screenshot);
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

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
            {teamMembers.slice(0,3).map((member) => {
              const mTasks = allTasks.filter(t => t.assignedTo === member.name);
              const done = mTasks.filter((t) => t.status === 'completed').length;
              const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
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
                    <span className="text-[11px] text-slate-500">{done}/{mTasks.length} done</span>
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
              const RoleIcon = roleConfig[task.role]?.icon || Megaphone;
              const overdue = isOverdue(task.deadline, task.status as TaskStatus);
              const daysLeft = getDaysLeft(task.deadline);

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border shadow-sm p-4 transition-all ${
                    task.status === 'completed' 
                      ? 'bg-emerald-50/30 border-emerald-100' 
                      : overdue 
                        ? 'bg-white border-red-200' 
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${roleConfig[task.role]?.bg || 'bg-slate-100'} ${roleConfig[task.role]?.color || 'text-slate-600'}`}>
                            <RoleIcon size={10} />
                            {task.assignedTo}
                          </span>
                          <span className="text-[11px] text-slate-400">{task.client} {task.brand ? `(${task.brand})` : ''} · {task.campaign}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${(statusConfig[task.status] || statusConfig.pending).bg} ${(statusConfig[task.status] || statusConfig.pending).color} hover:opacity-80`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400" size={12} />
                    </div>
                  </div>
                  
                  {/* Notes History */}
                  {(task.roleNotes && task.roleNotes.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      {task.roleNotes.map((note, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-2 flex gap-2">
                          <div className="w-5 h-5 rounded bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold">{note.role.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-[11px] font-bold text-slate-700">{note.role} Notes</p>
                              <p className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</p>
                            </div>
                            <p className="text-[12px] text-slate-600 italic">"{note.message}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                    <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      <Calendar size={11} className={overdue ? 'text-red-500' : 'text-slate-400'} />
                      {overdue ? 'Overdue · ' : ''}{formatDeadline(task.deadline)}
                      {!overdue && task.status !== 'completed' && (
                        <span className={`text-[11px] ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          ({daysLeft > 0 ? `${daysLeft}d left` : 'Today'})
                        </span>
                      )}
                    </div>
                    {task.status === 'completed' && (
                      <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                        <CheckCircle2 size={12} />
                        {task.forwardedBy ? `Passed to ${task.assignedTo} (${task.role})` : 'Task Finalized'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <TaskCompletionModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole="Manager"
          teamMembers={teamMembers}
        />
      </div>
    </AppLayout>
  );
}
