'use client';

import React, { useState, useMemo, useEffect, Fragment } from 'react';
import AppLayout from '@/components/AppLayout';
import { Film, ChevronRight } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, UserRole } from '@/types';
import { STATIC_STRINGS, PAGE_ROLES, ROLES, TASK_STATUSES } from '@/utils/constants';
import { STATUS_CONFIG } from '@/utils/ui-configs';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { useUpdateTaskStatus, useAssignTask, useCompleteTask, useGetTasks } from '@/api/hooks/useTask';
import { useGetTeamsByRole } from '@/api/hooks/useTeam';
import { toApiRole } from '@/utils/roles';
import TaskCard from '../shooter-dashboard/components/TaskCard';


const WORKFLOW_STAGES = [
  STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING,
  STATIC_STRINGS.DASHBOARD_STAGE_RAW_UPLOAD,
  STATIC_STRINGS.DASHBOARD_STAGE_EDITING,
  STATIC_STRINGS.DASHBOARD_STAGE_ADS,
  STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE
];

export default function EditorDashboardPage() {
  useRoleGuard(PAGE_ROLES.EDITOR_DASHBOARD as unknown as UserRole[]);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TaskStatus>(TASK_STATUSES.PENDING as TaskStatus);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { mutateAsync: updateTaskStatusMutation } = useUpdateTaskStatus();
  const { mutateAsync: assignTaskMutation } = useAssignTask();
  const { mutateAsync: completeTaskMutation } = useCompleteTask();

  const tasksQuery = useGetTasks({ 
    page: 1, 
    limit: 100, 
    role: ROLES.EDITOR,
    status: activeTab,
    isHistory: true
  }, {
    enabled: mounted,
    select: (resp: any) => {
      if (!resp?.results?.data || !Array.isArray(resp.results.data)) return [];
      const mapped = resp.results.data.map((t: any) => ({
        id: t.task_id,
        title: t.task_title || t.taskTitle || STATIC_STRINGS.UNTITLED_TASK,
        description: t.description || '',
        assignedTo: t.workstage_role_name ,
        role: t.notes?.[0]?.assign_to?.role || t.assign_to?.role || t.assignee?.role || t.workflow_stage || ROLES.EDITOR,
        client: t.client_name || t.client?.clientName || STATIC_STRINGS.NOT_AVAILABLE,
        campaign: t.campaign?.campaignName || t.campaign_name || STATIC_STRINGS.NOT_AVAILABLE,
        deadline: (t.deadline_date || t.deadlineDate || '').split('T')[0] || STATIC_STRINGS.NOT_AVAILABLE,
        deadlineStatus: t.deadline_status,
        status: t.currentStatus || t.status || TASK_STATUSES.PENDING,
        priority: t.priority || 'medium',
        roleNotes: Array.isArray(t.notes) ? t.notes : (Array.isArray(t.roleNotes) ? t.roleNotes : []),
      })) as Task[];
      
      return mapped.filter((task, index, self) =>
        index === self.findIndex((t) => t.id === task.id)
      );
    }
  });

  const editorTasks = (tasksQuery.data as Task[]) || [];
  const isTasksLoading = tasksQuery.isLoading;
  const fetchTasks = tasksQuery.refetch;

  const teamQuery = useGetTeamsByRole(toApiRole(ROLES.ADS_MANAGER), {
    enabled: isModalOpen,
    select: (resp: any) => {
      const data = Array.isArray(resp?.results) ? resp.results : (resp?.results?.data || []);
      if (!Array.isArray(data)) return [];
      return data.map((m: any) => ({
        id: m.id,
        name: m.full_name || m.fullName || m.name,
        role: ROLES.ADS_MANAGER
      }));
    }
  });

  const teamMembers = (teamQuery.data as any[]) || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => ({
    pending: editorTasks.filter(t => t.status === TASK_STATUSES.PENDING).length,
    inProgress: editorTasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length,
    completed: editorTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length,
  }), [editorTasks]);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (newStatus === TASK_STATUSES.COMPLETED) {
      if (task.status === TASK_STATUSES.COMPLETED) return;
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
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Film size={20} className="text-purple-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.EDITOR_DASHBOARD_TITLE}</h1>
            <p className="text-[13px] text-slate-500">{user?.name || 'Team Member'} · {ROLES.EDITOR} Team</p>
          </div>
        </header>

        {/* Overview Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING, value: stats.pending, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS, value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED, value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm">
              <p className={`text-[24px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Workflow Pipeline Progress */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">{STATIC_STRINGS.DASHBOARD_WORKFLOW_OVERVIEW}</h2>
          <div className="flex items-center gap-1">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isActive = idx === 2; // Editing stage
              const isDone = idx < 2;
              return (
                <Fragment key={stage}>
                  <div className="flex-1 text-center">
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-purple-500' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-purple-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </Fragment>
              );
            })}
          </div>
        </section>

        {/* Main Task List Control */}
        <main className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-800">{STATIC_STRINGS.DASHBOARD_ASSIGNED_TASKS}</h2>
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {([TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.PENDING, TASK_STATUSES.COMPLETED] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TaskStatus)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab === TASK_STATUSES.IN_PROGRESS ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS : (STATUS_CONFIG[tab]?.label || tab)}
                </button>
              ))}
            </nav>
          </header>

          <div className="space-y-3">
            {isTasksLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-purple-400 rounded-full animate-spin mb-4" />
                <p className="text-[13px]">{STATIC_STRINGS.LOADING_TASKS}</p>
              </div>
            ) : editorTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
                <p className="text-[13px]">{STATIC_STRINGS.DASHBOARD_TASKS_FOUND} {activeTab}</p>
              </div>
            ) : (
              editorTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </main>

        <TaskCompletionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole={user?.role || ROLES.EDITOR}
          teamMembers={teamMembers as any}
        />
      </div>
    </AppLayout>
  );
}
