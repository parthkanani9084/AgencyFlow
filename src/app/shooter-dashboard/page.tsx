'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Camera, CheckCircle2, Timer, Circle, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';

const workflowStages = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

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

function isOverdue(deadline: string, status: TaskStatus) {
  return status !== 'completed' && new Date(deadline) < new Date();
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

const teamMembers = [
  { id: 'tm2', name: 'Jin Park', role: 'Editor' },
  { id: 'tm4', name: 'Amara Diallo', role: 'Editor' },
];

export default function ShooterDashboardPage() {
  useRoleGuard(['Owner', 'Shooter']);
  const { user } = useAuth();
  const { tasks: allTasks, updateTask } = useTasks();
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = React.useMemo(() => {
    return allTasks.filter(t => 
      t.role === 'Shooter' || 
      t.roleNotes?.some(n => n.role === 'Shooter') ||
      t.fromShooter === 'Marco Reyes' ||
      t.forwardedBy === 'Marco Reyes'
    );
  }, [allTasks]);

  const getEffectiveStatus = React.useCallback((t: Task): TaskStatus => {
    const isHandedOff = t.role !== 'Shooter' && t.roleNotes?.some(n => n.role === 'Shooter');
    if (isHandedOff) return 'completed';
    return t.status as TaskStatus;
  }, []);

  const stats = React.useMemo(() => ({
    pending: tasks.filter((t) => getEffectiveStatus(t) === 'pending').length,
    inProgress: tasks.filter((t) => getEffectiveStatus(t) === 'in_progress').length,
    completed: tasks.filter((t) => getEffectiveStatus(t) === 'completed').length,
  }), [tasks, getEffectiveStatus]);

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

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(t => getEffectiveStatus(t) === activeTab);
  }, [tasks, getEffectiveStatus, activeTab]);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

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
            { label: 'Pending', value: stats.pending, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
              return (
                <React.Fragment key={stage}>
                  <div className={`flex-1 text-center`}>
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-800">Assigned Tasks</h2>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
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
                  {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium">No tasks found in {activeTab}</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.deadline, task.status as TaskStatus);
                const daysLeft = getDaysLeft(task.deadline);

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border shadow-sm p-4 transition-all ${
                      getEffectiveStatus(task) === 'completed' 
                        ? 'bg-emerald-50/30 border-emerald-100' 
                        : overdue 
                          ? 'bg-white border-red-200' 
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-slate-900 truncate">{task.title}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{task.client} · {task.campaign}</p>
                        </div>
                      </div>
                      <div className="relative">
                        {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                        <select
                          value={getEffectiveStatus(task)}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${(statusConfig[getEffectiveStatus(task)] || statusConfig.pending).bg} ${(statusConfig[getEffectiveStatus(task)] || statusConfig.pending).color} hover:opacity-80`}
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
                        {task.roleNotes
                          .filter(note => note.role === 'Shooter')
                          .map((note, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-lg p-2.5 flex gap-2.5 border border-slate-100">
                            <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-[10px] font-bold">{(note.role || 'S').charAt(0)}</span>
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
                          <CheckCircle2 size={12} />
                          {task.forwardedBy ? `Passed to ${task.assignedTo} (${task.role})` : 'Task Finalized'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <TaskCompletionModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole={user?.role || 'Shooter'}
          teamMembers={teamMembers}
        />
      </div>
    </AppLayout>
  );
}
