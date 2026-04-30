'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Megaphone, CheckCircle2, Timer, Circle, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority, Campaign } from '@/types';
import TodayReportingCard from './components/TodayReportingCard';
import TaskCompletionModal from '@/components/TaskCompletionModal';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

const TEAM_MEMBERS = [
  { id: 'tm6', name: 'Priya Sharma', role: 'Manager' },
];

/**
 * Ads Manager Dashboard
 * Refactored for extreme simplicity, flat architecture, and strict global typing.
 */
export default function AdsManagerDashboardPage() {
  useRoleGuard(['Owner', 'Ads Manager']);
  const { user } = useAuth();
  const { tasks: allTasks, updateTask } = useTasks();
  
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [mounted, setMounted] = useState(false);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 1. Mount & Data Load
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('agencyflow_campaigns');
    if (saved) {
      try {
        setAllCampaigns(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load campaigns', e);
      }
    }
  }, []);

  // 2. Derived State (Simplified)
  const tasks = allTasks.filter(t => t.role === 'Ads Manager');
  const filteredTasks = tasks.filter(t => t.status === activeTab);
  
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  // 3. Handlers
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

  // 4. Helper Logic (Flat)
  const isOverdue = (deadline: string, status: TaskStatus) => {
    return status !== 'completed' && new Date(deadline) < new Date();
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysLeft = (deadline: string) => {
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Ads Manager Dashboard</h1>
            <p className="text-[13px] text-slate-500">{user?.name || 'Sofia Nguyen'} · Ads Team</p>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Handoff', value: stats.pending, color: 'text-blue-600', icon: Circle },
            { label: 'Active Campaigns', value: stats.inProgress, color: 'text-amber-600', icon: Timer },
            { label: 'Completed Ads', value: stats.completed, color: 'text-emerald-600', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-slate-50 ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <p className="text-[13px] font-medium text-slate-500">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Reporting Summary Section */}
        <TodayReportingCard user={user} campaigns={allCampaigns} />

        {/* Tab Selection */}
        <div className="flex items-center justify-between mb-6 pt-6 border-t border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-800 uppercase tracking-wider">Assigned Tasks</h2>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
            {[
              { id: 'in_progress', label: 'In Progress' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TaskStatus)}
                className={`px-4 py-1.5 rounded-md text-[12px] font-bold transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Task Listing */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-[13px] text-slate-400 font-medium">No tasks found in {activeTab}</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.status);
              const daysLeft = getDaysLeft(task.deadline);
              const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

              return (
                <div 
                  key={task.id} 
                  className={`rounded-xl border shadow-sm p-4 transition-all hover:shadow-md ${task.status === 'completed' ? 'bg-emerald-50/30 border-emerald-100' : overdue ? 'bg-white border-red-200 shadow-sm shadow-red-50' : 'bg-white border-slate-100'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 truncate">{task.title}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">{task.client} {task.brand ? `(${task.brand})` : ''} · {task.campaign}</p>
                      </div>
                    </div>
                    <div className="relative">
                      {overdue && <AlertCircle size={14} className="text-red-500 absolute -left-5 top-1/2 -translate-y-1/2" />}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer outline-none border-none ${config.bg} ${config.color} hover:opacity-80`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-slate-400" size={12} />
                    </div>
                  </div>

                  {/* Audit / Relay History */}
                  {task.roleNotes && task.roleNotes.length > 0 && (
                    <div className="mt-4 mb-4 space-y-2 border-t border-slate-100 pt-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History Log:</p>
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

                  {/* Footer Information */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-bold' : 'text-slate-500 font-medium'}`}>
                      <Calendar size={14} />
                      {overdue ? 'Overdue · ' : ''}{formatDeadline(task.deadline)}
                      {!overdue && task.status !== 'completed' && (
                        <span className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          ({daysLeft > 0 ? `${daysLeft}d left` : 'Today'})
                        </span>
                      )}
                    </div>
                    {task.status === 'completed' && (
                      <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-bold">
                        <CheckCircle2 size={12} />
                        {task.forwardedBy ? `Finalized by ${task.forwardedBy}` : 'Task Finalized'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Completion Modal */}
        <TaskCompletionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={onCompleteTask}
          userRole="Ads Manager"
          teamMembers={TEAM_MEMBERS}
        />
      </div>
    </AppLayout>
  );
}
