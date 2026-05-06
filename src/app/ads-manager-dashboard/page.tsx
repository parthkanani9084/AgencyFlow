'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Megaphone, CheckCircle2, Timer, Circle, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, Campaign } from '@/types';
import TodayReportingCard from './components/TodayReportingCard';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import { STATIC_STRINGS, PAGE_ROLES, STORAGE_KEY_CAMPAIGNS, TEAM_MEMBERS, ROLES } from '@/utils/constants';
import { PRIORITY_STYLES, STATUS_CONFIG as STATUS_STYLES } from '@/utils/ui-configs';
import { UserRole } from '@/types';



export default function AdsManagerDashboardPage() {
  useRoleGuard(PAGE_ROLES.ADS_TRACKING as unknown as UserRole[]);
  
  const { user } = useAuth();
  const { tasks: allTasks, updateTask } = useTasks();
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [mounted, setMounted] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
    if (saved) {
      try {
        setAllCampaigns(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse campaigns from storage', err);
      }
    }
  }, []);


  const getEffectiveStatus = (task: Task): TaskStatus => {
    const isHandedOffToOthers = task.role !== ROLES.ADS_MANAGER && task.roleNotes?.some(n => n.role === ROLES.ADS_MANAGER);
    return isHandedOffToOthers ? 'completed' : (task.status as TaskStatus);
  };

  const { filteredTasks, dashboardStats, relevantTasks } = useMemo(() => {
    const relevant = allTasks.filter(t => 
      t.role === ROLES.ADS_MANAGER || t.roleNotes?.some(n => n.role === ROLES.ADS_MANAGER)
    );

    const stats = { pending: 0, in_progress: 0, completed: 0 };
    const filtered: Task[] = [];

    relevant.forEach(task => {
      const status = getEffectiveStatus(task);
      stats[status]++;
      if (status === activeTab) filtered.push(task);
    });

    return { 
      relevantTasks: relevant,
      filteredTasks: filtered, 
      dashboardStats: stats 
    };
  }, [allTasks, activeTab]);

  // Handlers
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

  // View Helpers
  const isOverdue = (deadline?: string, status?: TaskStatus) => {
    if (!deadline || status === 'completed') return false;
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysLeft = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  };

  // Prevent Hydration Flash
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
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
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
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_PENDING_HANDOFF, value: dashboardStats.pending, color: 'text-blue-600', icon: Circle },
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_ACTIVE_CAMPAIGNS, value: dashboardStats.in_progress, color: 'text-amber-600', icon: Timer },
            { label: STATIC_STRINGS.ADS_DASHBOARD_STAT_COMPLETED_ADS, value: dashboardStats.completed, color: 'text-emerald-600', icon: CheckCircle2 },
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

        {/* Main Task List Section */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-slate-800">
              {STATIC_STRINGS.ADS_DASHBOARD_ASSIGNED_TASKS}
            </h2>
            
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['in_progress', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'in_progress' ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS : 
                   tab === 'pending' ? STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING : 
                   STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">
                  {STATIC_STRINGS.ADS_DASHBOARD_NO_TASKS} {activeTab}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const taskStatus = getEffectiveStatus(task);
                const overdue = isOverdue(task.deadline, taskStatus);
                const daysLeft = task.deadline ? getDaysLeft(task.deadline) : 0;

                return (
                  <article 
                    key={task.id} 
                    className={`rounded-xl border shadow-sm p-4 transition-all hover:shadow-md ${
                      taskStatus === 'completed' 
                        ? 'bg-emerald-50/30 border-emerald-100' 
                        : overdue ? 'bg-white border-red-200 shadow-sm shadow-red-50' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_STYLES[task.priority]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 truncate">{task.title}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {task.client} {task.brand ? `(${task.brand})` : ''} · {task.campaign}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative">
                        {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                        <select
                          value={taskStatus}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer outline-none border-none ${STATUS_STYLES[taskStatus]?.bg || STATUS_STYLES.pending.bg} ${STATUS_STYLES[taskStatus]?.color || STATUS_STYLES.pending.color} hover:opacity-80`}
                        >
                          <option value="pending">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_PENDING}</option>
                          <option value="in_progress">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_IN_PROGRESS}</option>
                          <option value="completed">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</option>
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400" size={12} />
                      </div>
                    </div>


                    {task.roleNotes && task.roleNotes.length > 0 && (
                      <div className="mt-4 mb-4 space-y-2 border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {STATIC_STRINGS.ADS_DASHBOARD_HISTORY_LOG}
                        </p>
                        {task.roleNotes.map((note, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-slate-700">{note.role} · {note.author}</span>
                              <span className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[12px] text-slate-600 italic leading-relaxed">"{note.message}"</p>
                          </div>
                        ))}
                      </div>
                    )}


                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'}`}>
                        <Calendar size={14} />
                        {overdue ? `${STATIC_STRINGS.ADS_DASHBOARD_OVERDUE} · ` : ''}
                        {task.deadline ? formatDeadline(task.deadline) : STATIC_STRINGS.ADS_DASHBOARD_NO_DEADLINE}
                        {!overdue && taskStatus !== 'completed' && task.deadline && (
                          <span className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                            ({daysLeft > 0 ? `${daysLeft}${STATIC_STRINGS.ADS_DASHBOARD_DAYS_LEFT}` : STATIC_STRINGS.ADS_DASHBOARD_TODAY})
                          </span>
                        )}
                      </div>
                      
                      {taskStatus === 'completed' && (
                        <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-bold">
                          <CheckCircle2 size={12} />
                          {task.forwardedBy 
                            ? `${STATIC_STRINGS.ADS_DASHBOARD_FINALIZED_BY} ${task.forwardedBy}` 
                            : STATIC_STRINGS.ADS_DASHBOARD_TASK_FINALIZED}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>


        <TaskCompletionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole={user?.role || ROLES.ADS_MANAGER}
          teamMembers={TEAM_MEMBERS}
        />
      </div>
    </AppLayout>
  );
}
