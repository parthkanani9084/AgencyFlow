'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, CheckCircle2, Timer, Circle, Calendar, ChevronRight, Camera, Film, Megaphone, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority, TaskRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { useAuth } from '@/context/AuthContext';
import { STATIC_STRINGS, PAGE_ROLES, ROLES, TEAM_MEMBERS as CONST_TEAM_MEMBERS } from '@/utils/constants';
import { UserRole } from '@/types';
 
interface TeamMember {
  id: string;
  name: string;
  role: string;
  color?: string;
  mTasksCount?: number;
  doneCount?: number;
  pct?: number;
}

const ROLE_CONFIG: Record<TaskRole | string, { color: string; bg: string; icon: React.ElementType }> = {
  [ROLES.SHOOTER]: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  [ROLES.EDITOR]: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  [ROLES.ADS_MANAGER]: { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING, color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS, color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED, color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

const ROLE_COLORS: Record<string, string> = {
  [ROLES.SHOOTER]: 'bg-blue-600',
  [ROLES.EDITOR]: 'bg-purple-600',
  [ROLES.ADS_MANAGER]: 'bg-orange-600',
  [ROLES.MANAGER]: 'bg-teal-600',
  [ROLES.OWNER]: 'bg-violet-600',
};

const ROLE_FILTERS: { label: string; value: TaskRole | 'all' }[] = [
  { label: STATIC_STRINGS.DASHBOARD_ALL, value: 'all' },
  { label: ROLES.SHOOTER, value: ROLES.SHOOTER as TaskRole },
  { label: ROLES.EDITOR, value: ROLES.EDITOR as TaskRole },
  { label: ROLES.ADS_MANAGER, value: ROLES.ADS_MANAGER as TaskRole },
];

const isOverdue = (deadline: string, status: string) => {
  return status !== 'completed' && new Date(deadline) < new Date();
};

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysLeft = (deadline: string) => {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
};

export default function ManagerDashboardPage() {
  useRoleGuard(PAGE_ROLES.MANAGER_DASHBOARD as unknown as UserRole[]);
  const { user } = useAuth();
  const { tasks: allTasks, updateTask } = useTasks();

  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTasks = useMemo(() => 
    allTasks.filter(t => roleFilter === 'all' || t.role === roleFilter),
  [allTasks, roleFilter]);

  const stats = useMemo(() => ({
    total: allTasks.length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    overdue: allTasks.filter(t => isOverdue(t.deadline, t.status)).length,
  }), [allTasks]);

  const teamOverviewData = useMemo<TeamMember[]>(() => {
    const rawMembers = Array.isArray(CONST_TEAM_MEMBERS) ? (CONST_TEAM_MEMBERS as any[]) : [];
    return rawMembers.slice(0, 3).map((member) => {
      const mTasks = allTasks.filter(t => t.assignedTo === member.name);
      const done = mTasks.filter(t => t.status === 'completed').length;
      const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
      const color = ROLE_COLORS[member.role] || 'bg-slate-600';
      return { ...member, mTasksCount: mTasks.length, doneCount: done, pct, color };
    });
  }, [allTasks]);

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
        {/* Page Header */}
        <header className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <Users size={20} className="text-teal-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.MANAGER_DASHBOARD_TITLE}</h1>
            <p className="text-[13px] text-slate-500">{user?.name} · {user?.role}</p>
          </div>
        </header>

        {/* Executive Stats Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: STATIC_STRINGS.DASHBOARD_TOTAL_TASKS, value: stats.total, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS, value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED, value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: STATIC_STRINGS.DASHBOARD_OVERDUE, value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className={`text-[24px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Team Productivity Overview */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">{STATIC_STRINGS.DASHBOARD_TEAM_OVERVIEW}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {teamOverviewData.map((member) => (
              <div key={member.id} className="rounded-lg border border-slate-100 p-3">
                <header className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${member.color || 'bg-slate-600'} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-[10px] font-bold text-white">{(member.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-800">{member.name}</p>
                    <p className="text-[11px] text-slate-400">{member.role}</p>
                  </div>
                </header>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">{member.doneCount}/{member.mTasksCount} {STATIC_STRINGS.DASHBOARD_DONE}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{member.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${member.color}`} style={{ width: `${member.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <main>
          <header className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.DASHBOARD_ALL_TASKS}</h2>
            <nav className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRoleFilter(f.value)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${
                    roleFilter === f.value
                      ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <article className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">{STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS}</p>
              </article>
            ) : (
              filteredTasks.map((task) => {
                const RoleIcon = ROLE_CONFIG[task.role]?.icon || Megaphone;
                const overdue = isOverdue(task.deadline, task.status as TaskStatus);
                const daysLeft = getDaysLeft(task.deadline);

                return (
                  <article
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
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority || 'medium']}`} style={{ marginTop: 6 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-semibold text-slate-900 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_CONFIG[task.role]?.bg || 'bg-slate-100'} ${ROLE_CONFIG[task.role]?.color || 'text-slate-600'}`}>
                              <RoleIcon size={10} />
                              {task.assignedTo}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {task.client} {task.brand ? `(${task.brand})` : ''} · {task.campaign}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${(STATUS_CONFIG[task.status] || STATUS_CONFIG.pending).bg} ${(STATUS_CONFIG[task.status] || STATUS_CONFIG.pending).color} hover:opacity-80`}
                        >
                          <option value="pending">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING}</option>
                          <option value="in_progress">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS}</option>
                          <option value="completed">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</option>
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400" size={12} />
                      </div>
                    </div>
                    
                    {/* Collaborative Context / Role Notes */}
                    {(task.roleNotes && task.roleNotes.length > 0) && (
                      <section className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {task.roleNotes.map((note, idx) => (
                          <div key={idx} className="bg-slate-50 rounded-lg p-2 flex gap-2 border border-slate-100/50">
                            <div className="w-5 h-5 rounded bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-[9px] font-bold">{note.role.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <header className="flex items-center justify-between mb-0.5">
                                <p className="text-[11px] font-bold text-slate-700">{note.role} {STATIC_STRINGS.DASHBOARD_TEAM_NOTES}</p>
                                <time className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</time>
                              </header>
                              <p className="text-[12px] text-slate-600 italic">"{note.message}"</p>
                            </div>
                          </div>
                        ))}
                      </section>
                    )}

                    <footer className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                        <Calendar size={11} className={overdue ? 'text-red-500' : 'text-slate-400'} />
                        {overdue ? STATIC_STRINGS.DASHBOARD_OVERDUE_LABEL : ''}{formatDeadline(task.deadline)}
                        {!overdue && task.status !== 'completed' && (
                          <span className={`text-[11px] ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                            ({daysLeft > 0 ? `${daysLeft}${STATIC_STRINGS.DASHBOARD_DAYS_LEFT}` : STATIC_STRINGS.DASHBOARD_TODAY})
                          </span>
                        )}
                      </div>
                      {task.status === 'completed' && (
                        <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium ml-auto">
                          <CheckCircle2 size={12} />
                          {task.forwardedBy ? `${STATIC_STRINGS.DASHBOARD_PASSED_TO} ${task.assignedTo} (${task.role})` : STATIC_STRINGS.DASHBOARD_TASK_FINALIZED}
                        </div>
                      )}
                    </footer>
                  </article>
                );
              })
            )}
          </div>
        </main>

        <TaskCompletionModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole={ROLES.MANAGER}
          teamMembers={CONST_TEAM_MEMBERS as unknown as any}
        />
      </div>
    </AppLayout>
  );
}
