'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Camera, CheckCircle2, Calendar, ChevronRight, AlertCircle, Users } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, UserRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { STATIC_STRINGS, PAGE_ROLES, ROLES } from '@/utils/constants';
import { PRIORITY_STYLES as PRIORITY_DOT, STATUS_CONFIG } from '@/utils/ui-configs';
import { useUpdateTask, useUpdateTaskStatus, useAssignTask } from '@/api/hooks/useTask';
import { useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/api/services/team.service';
import { taskService } from '@/api/services/task.service';

const WORKFLOW_STAGES = [
  STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING,
  STATIC_STRINGS.DASHBOARD_STAGE_RAW_UPLOAD,
  STATIC_STRINGS.DASHBOARD_STAGE_EDITING,
  STATIC_STRINGS.DASHBOARD_STAGE_ADS,
  STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE
];
// --- Helpers ---
const isOverdue = (deadline: string, status: TaskStatus) => {
  return status !== 'completed' && new Date(deadline) < new Date();
};

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getDaysLeft = (deadline: string) => {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
};


export default function ShooterDashboardPage() {
  useRoleGuard(PAGE_ROLES.SHOOTER_DASHBOARD as unknown as UserRole[]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [shooterTasks, setShooterTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; role: string }[]>([]);

  const { mutateAsync: updateTaskMutation } = useUpdateTask();
  const { mutateAsync: updateTaskStatusMutation } = useUpdateTaskStatus();
  const { mutateAsync: assignTaskMutation } = useAssignTask();

  const fetchTasks = async (status?: TaskStatus) => {
    setIsTasksLoading(true);
    try {
      const resp = await taskService.getTasks({ 
        page: 1, 
        limit: 100, 
        role: ROLES.SHOOTER,
        status: status || activeTab,
        isHistory: true
      });
      if (resp?.results?.data) {
        const mapped = resp.results.data.map((t: any) => ({
          id: t.task_id || t.id,
          title: t.task_title || t.taskTitle || 'Untitled Task',
          description: t.description || '',
          assignedTo: t.assign_to?.name || t.notes?.[0]?.assign_to?.name || t.assignee?.fullName || t.assignee?.full_name || 'Unassigned',
          role: t.assignee?.role || t.workflow_stage || ROLES.SHOOTER,
          client: t.client_name || t.client?.clientName || 'N/A',
          deadline: (t.deadline_date || t.deadlineDate || '').split('T')[0] || 'N/A',
          deadlineStatus: t.deadline_status,
          status: t.currentStatus || t.status || 'pending',
          priority: t.priority || 'medium',
          roleNotes: Array.isArray(t.notes) ? t.notes : (Array.isArray(t.roleNotes) ? t.roleNotes : []),
        })) as Task[];
        const uniqueTasks = mapped.filter((task, index, self) =>
          index === self.findIndex((t) => t.id === task.id)
        );
        
        setShooterTasks(uniqueTasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const resp = await teamService.getTeamsByRole('editor');
      if (resp?.results) {
        const data = Array.isArray(resp.results) ? resp.results : (resp.results.data || []);
        setTeamMembers(data.map((m: any) => ({
          id: m.id,
          name: m.full_name || m.fullName || m.name,
          role: ROLES.EDITOR
        })));
      }
    } catch (err) { }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTasks();
    }
  }, [mounted, activeTab]);

  useEffect(() => {
    if (isModalOpen) {
      fetchTeam();
    }
  }, [isModalOpen]);

  const getEffectiveStatus = useCallback((t: any): TaskStatus => {
    return (t.currentStatus || t.status) as TaskStatus;
  }, []);

  const stats = useMemo(() => ({
    pending: shooterTasks.filter(t => t.status === 'pending').length,
    inProgress: shooterTasks.filter(t => t.status === 'in_progress').length,
    completed: shooterTasks.filter(t => t.status === 'completed').length,
  }), [shooterTasks]);

  const filteredTasks = shooterTasks;

  const handleStatusChange = async (task: any, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setIsModalOpen(true);
    } else if (newStatus === 'pending' || newStatus === 'in_progress') {
      try {
        await updateTaskStatusMutation({ taskId: task.id, status: newStatus });
        fetchTasks();
      } catch (err) { }
    } else {
      try {
        await updateTaskMutation({ taskId: task.id, payload: { status: newStatus } });
        fetchTasks();
      } catch (err) { }
    }
  };

  const onCompleteTask = async (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string) => {
    try {
      if (nextMember) {
        const member = teamMembers.find(m => m.name === nextMember.name && m.role === nextMember.role);
        if (member) {
          await assignTaskMutation({ taskId, assignedTo: member.id, notes: notes });
        }
      }
      await fetchTasks();
      setIsModalOpen(false);
    } catch (err) { }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Camera size={20} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.SHOOTER_DASHBOARD_TITLE}</h1>
            <p className="text-[13px] text-slate-500">Marco Reyes · {ROLES.SHOOTER} Team</p>
          </div>
        </header>

        {/* Workload Summary Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING, value: stats.pending, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS, value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED, value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className={`text-[24px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Production Stage Tracking */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">{STATIC_STRINGS.DASHBOARD_WORKFLOW_OVERVIEW}</h2>
          <div className="flex items-center gap-1">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isActive = idx === 0;
              return (
                <React.Fragment key={stage}>
                  <div className="flex-1 text-center">
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Task Management Control */}
        <main className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.DASHBOARD_ASSIGNED_TASKS}</h2>
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['in_progress', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab === 'in_progress' ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS : (STATUS_CONFIG[tab]?.label || tab)}
                </button>
              ))}
            </nav>
          </header>

          <div className="space-y-3">
            {isTasksLoading ? (
              <article className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">Loading tasks...</p>
              </article>
            ) : filteredTasks.length === 0 ? (
              <article className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">{STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS}</p>
              </article>
            ) : (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.deadline, task.status as TaskStatus);
                const daysLeft = getDaysLeft(task.deadline);
                const currentStatus = getEffectiveStatus(task);

                return (
                  <article
                    key={task.id}
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
                          <p className="text-[12px] text-slate-500 mt-0.5">{task.client}</p>
                        </div>
                      </div>
                      <div className="relative">
                        {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${(STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending).bg} ${(STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending).color} hover:opacity-80`}
                        >
                          <option value="pending">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING}</option>
                          <option value="in_progress">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS}</option>
                          <option value="completed">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</option>
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400" size={12} />
                      </div>
                    </div>

                    {/* Role-Specific Collaborative Notes */}
                    {Array.isArray(task.roleNotes) && task.roleNotes.length > 0 && (
                      <section className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{STATIC_STRINGS.DASHBOARD_TEAM_NOTES}</p>
                        {task.roleNotes.map((note, idx) => (
                          <div key={idx} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100/50">
                            <header className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold">{(note.role || 'S').charAt(0)}</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-700">{note.name || note.role}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{note.role}</span>
                              </div>
                              <time className="text-[10px] text-slate-400 font-medium">{new Date(note.created_at || note.timestamp || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                            </header>
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
                      </section>
                    )}

                    <footer className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                        <Calendar size={12} />
                        {overdue ? STATIC_STRINGS.DASHBOARD_OVERDUE_LABEL : ''}{formatDeadline(task.deadline)}
                        {!overdue && task.status !== 'completed' && (
                          <span className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                            ({task.deadlineStatus || (daysLeft > 0 ? `${daysLeft}${STATIC_STRINGS.DASHBOARD_DAYS_LEFT}` : STATIC_STRINGS.DASHBOARD_TODAY)})
                          </span>
                        )}
                        {task.status === 'completed' && task.deadlineStatus && (
                          <span className="ml-1 text-slate-400 font-medium">({task.deadlineStatus})</span>
                        )}
                      </div>
                      {task.status === 'completed' && (
                        <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-bold ml-auto">
                          <Users size={14} />
                          <span>Assigned To: {task.assignedTo}</span>
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
          userRole={user?.role || ROLES.SHOOTER}
          teamMembers={teamMembers as any}
        />
      </div>
    </AppLayout>
  );
}
