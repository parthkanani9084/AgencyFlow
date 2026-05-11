'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, CheckCircle2, Timer, Circle, Calendar, ChevronRight, Camera, Film, Megaphone, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { STATIC_STRINGS, PAGE_ROLES, ROLES } from '@/utils/constants';
import { Task, TaskStatus, TaskPriority, TaskRole, UserRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { useUpdateTask, useUpdateTaskStatus, useAssignTask, useCompleteTask } from '@/api/hooks/useTask';
import { useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/api/services/team.service';
import { taskService } from '@/api/services/task.service';

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

const ROLE_FILTERS: { label: string; value: TaskRole }[] = [
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
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [roleFilter, setRoleFilter] = useState<TaskRole>(ROLES.SHOOTER as TaskRole);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const { mutateAsync: updateTaskMutation } = useUpdateTask();
  const { mutateAsync: updateTaskStatusMutation } = useUpdateTaskStatus();
  const { mutateAsync: assignTaskMutation } = useAssignTask();
  const { mutateAsync: completeTaskMutation } = useCompleteTask();

  const fetchTasks = async () => {
    setIsTasksLoading(true);
    const getRoleParam = (role: string) => {
      const map: Record<string, string> = {
        [ROLES.SHOOTER]: 'shooter',
        [ROLES.EDITOR]: 'editor',
        [ROLES.ADS_MANAGER]: 'ads-manager',
        [ROLES.SOCIAL_MEDIA_MANAGER]: 'social-media-manager',
        [ROLES.MANAGER]: 'manager',
        [ROLES.OWNER]: 'owner'
      };
      return map[role] || role.toLowerCase().replace(/ /g, '-');
    };

    try {
      const resp = await taskService.getTasks({
        page: 1,
        limit: 100,
        role: getRoleParam(roleFilter),
        isHistory: true
      });
      if (resp?.results?.data) {
        const mapped = resp.results.data.map((t: any) => ({
          id: t.task_id || t.id,
          title: t.task_title || t.taskTitle || 'Untitled Task',
          description: t.description || '',
          assignedTo: t.workstage_role_name || t.notes?.[0]?.assign_to?.name || t.assign_to?.name || t.assignee?.name || t.assignee?.fullName || t.assignee?.full_name || 'Unassigned',
          role: t.notes?.[0]?.assign_to?.role || t.assign_to?.role || t.assignee?.role || t.workflow_stage || 'N/A',
          client: t.client_name || t.client?.clientName || 'N/A',
          deadline: (t.deadline_date || t.deadlineDate || '').split('T')[0] || 'N/A',
          status: t.currentStatus || t.status || 'pending',
          priority: t.priority || 'medium',
          campaign: t.campaign?.campaignName || t.campaign_name || 'General',
          roleNotes: t.roleNotes || [],
        })) as Task[];
        const uniqueTasks = mapped.filter((task, index, self) =>
          index === self.findIndex((t) => t.id === task.id)
        );
        setAllTasks(uniqueTasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchTeam = async () => {
      try {
        const resp = await teamService.getTeamMembers();
        if (resp?.results?.data) {
          setTeamMembers(resp.results.data.map((m: any) => ({
            id: m.id,
            name: m.fullName || m.name,
            role: m.role
          })));
        }
      } catch (err) { }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [roleFilter]);

  const stats = useMemo(() => ({
    total: allTasks.length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    overdue: allTasks.filter(t => isOverdue(t.deadline, t.status)).length,
  }), [allTasks]);

  const teamOverviewData = useMemo<TeamMember[]>(() => {
    return teamMembers.slice(0, 3).map((member) => {
      const mTasks = allTasks.filter(t => t.assignedTo === member.name);
      const done = mTasks.filter(t => t.status === 'completed').length;
      const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
      const color = ROLE_COLORS[member.role] || 'bg-slate-600';
      return { ...member, mTasksCount: mTasks.length, doneCount: done, pct, color };
    });
  }, [allTasks, teamMembers]);

  const handleStatusChange = async (task: any, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setIsModalOpen(true);
    } else {
      try {
        await updateTaskStatusMutation({ taskId: task.id, status: newStatus });
        fetchTasks();
      } catch (err) { }
    }
  };

  const onCompleteTask = async (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string | File) => {
    try {
      let assignedToId: string | undefined;
      if (nextMember) {
        const member = teamMembers.find(m => m.name === nextMember.name);
        if (member) assignedToId = member.id;
      }
      
      if (assignedToId) {
        await assignTaskMutation({ 
          taskId, 
          assignedTo: assignedToId,
          notes 
        });
      } else {
        await completeTaskMutation({ 
          taskId, 
          notes, 
          screenshot 
        });
      }
      fetchTasks();
      setIsModalOpen(false);
    } catch (err) { }
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
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap ${roleFilter === f.value
                      ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="space-y-2.5">
            {isTasksLoading ? (
              <article className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">Loading tasks...</p>
              </article>
            ) : allTasks.length === 0 ? (
              <article className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">{STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS}</p>
              </article>
            ) : (
              allTasks.map((task) => {
                const RoleIcon = ROLE_CONFIG[task.role]?.icon || Megaphone;
                const overdue = isOverdue(task.deadline, task.status as TaskStatus);
                const daysLeft = getDaysLeft(task.deadline);

                return (
                  <article
                    key={task.id}
                    className={`rounded-xl border shadow-sm p-4 transition-all ${task.status === 'completed'
                        ? 'bg-emerald-50/30 border-emerald-100'
                        : overdue
                          ? 'bg-white border-red-200'
                          : 'bg-white border-slate-200'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
            
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-semibold text-slate-900 truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_CONFIG[task.role]?.bg || 'bg-slate-100'} ${ROLE_CONFIG[task.role]?.color || 'text-slate-600'}`}>
                              <RoleIcon size={10} />
                              {task.assignedTo}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {task.client}
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
                    {Array.isArray(task.roleNotes) && task.roleNotes.length > 0 && (
                      <div className="mt-4 mb-4 space-y-2 border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          {STATIC_STRINGS.ADS_DASHBOARD_HISTORY_LOG}
                        </p>
                        {task.roleNotes.map((note: any, idx: number) => (
                          <div key={idx} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${ROLE_CONFIG[note.role]?.bg || 'bg-slate-100'} ${ROLE_CONFIG[note.role]?.color || 'text-slate-600'}`}>
                                  <span className="text-[10px] font-bold">{(note.role || 'U').charAt(0)}</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-700">{note.name || 'Unknown'}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{note.role}</span>
                              </div>
                              <time className="text-[10px] text-slate-400 font-medium">
                                {new Date(note.created_at || note.timestamp || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </time>
                            </div>
                            <p className="text-[12px] text-slate-600 leading-relaxed">
                              {note.note || note.message}
                            </p>
                            {note.screenshot && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                                <img src={note.screenshot} alt="Task Proof" className="w-full h-auto max-h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
          teamMembers={teamMembers as any}
        />
      </div>
    </AppLayout>
  );
}
