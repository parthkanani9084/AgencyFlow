'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import AppLayout from '@/components/AppLayout';
import { Megaphone, CheckCircle2, Timer, Circle, ChevronRight } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, UserRole } from '@/types';
import TodayReportingCard from './components/TodayReportingCard';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { STATIC_STRINGS, PAGE_ROLES, STORAGE_KEY_CAMPAIGNS, ROLES, TASK_STATUSES } from '@/utils/constants';
import { useUpdateTaskStatus, useCompleteTask, useGetTasksHistory } from '@/api/hooks/useTask';
import TaskCard from '../shooter-dashboard/components/TaskCard';
const WORKFLOW_STAGES = [
  STATIC_STRINGS.DASHBOARD_STAGE_SHOOTING,
  STATIC_STRINGS.DASHBOARD_STAGE_EDITING,
  STATIC_STRINGS.DASHBOARD_STAGE_ADS,
  STATIC_STRINGS.DASHBOARD_STAGE_COMPLETE
];


export default function AdsManagerDashboardPage() {
  useRoleGuard(PAGE_ROLES.ADS_TRACKING as unknown as UserRole[]);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TaskStatus>(TASK_STATUSES.PENDING as TaskStatus);
  const [mounted, setMounted] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { mutateAsync: updateTaskStatusMutation } = useUpdateTaskStatus();
  const { mutateAsync: completeTaskMutation } = useCompleteTask();

  const tasksQuery = useGetTasksHistory({
    page: 1,
    limit: 100,
    role: ROLES.ADS_MANAGER,
    status: activeTab,
  }, {
    enabled: mounted,
    select: (resp: any) => {
      if (!resp?.results?.data || !Array.isArray(resp.results.data)) return [];
      const mapped = resp.results.data.map((t: any) => ({
        id: t.task_id || t.id,
        title: t.task_title || t.taskTitle || STATIC_STRINGS.UNTITLED_TASK,
        description: t.description || '',
        assignedTo: t.workstage_role_name || t.notes?.[0]?.assign_to?.name || t.assign_to?.name || t.assignee?.name || t.assignee?.fullName || t.assignee?.full_name || STATIC_STRINGS.COMMON_UNASSIGNED,
        role: t.notes?.[0]?.assign_to?.role || t.assign_to?.role || t.assignee?.role || t.workflow_stage || ROLES.ADS_MANAGER,
        client: t.client_name || STATIC_STRINGS.NOT_AVAILABLE,
        brand: t.brand_name || STATIC_STRINGS.NOT_AVAILABLE,
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

  const adsTasks = (tasksQuery.data as Task[]) || [];
  const isTasksLoading = tasksQuery.isLoading;
  const fetchTasks = tasksQuery.refetch;

  const teamMembers: any[] = [];

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
    if (saved) {
      try {
        setAllCampaigns(JSON.parse(saved));
      } catch (err) { }
    }
  }, []);

  const stats = useMemo(() => ({
    pending: adsTasks.filter(t => t.status === TASK_STATUSES.PENDING).length,
    inProgress: adsTasks.filter(t => t.status === TASK_STATUSES.IN_PROGRESS).length,
    completed: adsTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length,
  }), [adsTasks]);

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
      await completeTaskMutation({ taskId, notes, screenshot, assignedTo: assignedToId });
      await fetchTasks();
      setIsModalOpen(false);
    } catch (err) { }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-700" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-slate-900">
              {STATIC_STRINGS.ADS_DASHBOARD_TITLE}
            </h1>
            <p className="text-[13px] text-slate-500">
              {user?.name || STATIC_STRINGS.COMMON_UNASSIGNED} · {STATIC_STRINGS.ADS_DASHBOARD_TEAM_NAME}
            </p>
          </div>
        </header>

        {/* Global Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_PENDING_HANDOFF, value: stats.pending, color: 'text-blue-600', icon: Circle },
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_ACTIVE_CAMPAIGNS, value: stats.inProgress, color: 'text-amber-600', icon: Timer },
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_COMPLETED_ADS, value: stats.completed, color: 'text-emerald-600', icon: CheckCircle2 },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[13px] font-medium text-slate-500">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Performance Overview Component */}
        <TodayReportingCard user={user} campaigns={allCampaigns} />

        {/* Workflow Stage Overview */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-slate-800 mb-6">{STATIC_STRINGS.DASHBOARD_WORKFLOW_OVERVIEW}</h2>
          <div className="flex items-center gap-3 mb-3">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isActive = idx === 2;
              const isDone = idx < 2;
              const isPending = idx > 2;

              let barColor = 'bg-slate-200';
              let textColor = 'text-slate-400';
              if (isDone) {
                barColor = 'bg-[#10b981]';
                textColor = 'text-[#059669]';
              } else if (isActive) {
                barColor = 'bg-[#f97316]';
                textColor = 'text-[#ea580c]';
              }

              return (
                <Fragment key={stage}>
                  <div className="flex-1 flex flex-col items-center">
                    <div className={`w-full h-1.5 rounded-full ${barColor}`} />
                    <span className={`text-[11px] mt-2 font-medium ${textColor}`}>{stage}</span>
                  </div>
                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <div className="flex items-center pb-4">
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </section>

        {/* Main Task List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-slate-800">
              {STATIC_STRINGS.ADS_DASHBOARD_ASSIGNED_TASKS}
            </h2>

            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {([TASK_STATUSES.PENDING, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.COMPLETED] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as TaskStatus)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab === TASK_STATUSES.IN_PROGRESS ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS :
                    tab === TASK_STATUSES.PENDING ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING :
                      STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            {isTasksLoading ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">{STATIC_STRINGS.LOADING_TASKS}</p>
              </div>
            ) : adsTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">
                  {STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS} {activeTab}
                </p>
              </div>
            ) : (
              adsTasks.map((task) => (
                <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </section>

        <TaskCompletionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole={user?.role || ROLES.ADS_MANAGER}
          teamMembers={teamMembers as any}
        />
      </div>
    </AppLayout>
  );
}
