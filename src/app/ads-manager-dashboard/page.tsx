'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Megaphone, Film, CheckCircle2, Timer, Circle, Calendar, ChevronRight, TrendingUp, DollarSign, Upload, Info, ExternalLink } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  EDITOR_DONE: { label: 'Ready for Ads', color: 'text-blue-600', bg: 'bg-blue-50', icon: Film },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const priorityDot: Record<TaskPriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
};

const platformColors: Record<string, { color: string; bg: string }> = {
  Meta: { color: 'text-blue-700', bg: 'bg-blue-100' },
  Google: { color: 'text-red-700', bg: 'bg-red-100' },
  Pinterest: { color: 'text-pink-700', bg: 'bg-pink-100' },
};

function isOverdue(deadline: string, status: TaskStatus) {
  return status !== 'completed' && new Date(deadline) < new Date();
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdsManagerDashboardPage() {
  useRoleGuard(['Owner', 'Ads Manager']);
  const { user } = useAuth();
  const { tasks: allTasks, updateTask } = useTasks();
  const tasks = allTasks.filter(t => t.role === 'Ads Manager');
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [screenshot, setScreenshot] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending' || t.status === 'EDITOR_DONE').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setScreenshot('');
      setNotes('');
      setFormErrors({});
      setIsModalOpen(true);
    } else {
      updateTask(task.id, { status: newStatus });
    }
  };

  const handleFinalSubmit = () => {
    if (!screenshot.trim()) {
      setFormErrors({ screenshot: 'Screenshot link is required' });
      return;
    }
    
    if (selectedTask) {
      const newNote = {
        role: 'Ads Manager' as const,
        message: notes,
        timestamp: new Date().toISOString(),
        author: user?.name || 'Ads Manager'
      };

      updateTask(selectedTask.id, {
        status: 'completed',
        screenshot: screenshot,
        notes: notes || undefined,
        roleNotes: [...(selectedTask.roleNotes || []), newNote],
        forwardedBy: user?.name
      });
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'completed') return t.status === 'completed';
    return (t.role === 'Ads Manager' && t.status === activeTab) || (activeTab === 'pending' && t.status === 'EDITOR_DONE');
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Ads Manager Dashboard</h1>
            <p className="text-[13px] text-slate-500">{user?.name || 'Sofia Nguyen'} · Ads Team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Handoff', value: stats.pending, color: 'text-blue-600', icon: Film },
            { label: 'Active Campaigns', value: stats.inProgress, color: 'text-amber-600', icon: Timer },
            { label: 'Completed Ads', value: stats.completed, color: 'text-emerald-600', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[14px] font-semibold text-slate-800">Assigned Tasks</h2>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
            {[
              { id: 'in_progress', label: 'In Progress' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TaskStatus)}
                className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-[13px] text-slate-400 font-medium">No campaigns found</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.status);
              const spendPct = task.budget > 0 ? Math.min(100, Math.round((task.spent / task.budget) * 100)) : 0;
              const isCompleted = task.status === 'completed';

              return (
                <div key={task.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
                      <div>
                        <p className="text-[14px] font-bold text-slate-900">{task.title}</p>
                        <p className="text-[12px] text-slate-500">{task.client} · {task.campaign}</p>
                      </div>
                    </div>
                    <select
                      value={task.status === 'EDITOR_DONE' ? 'pending' : task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      className={`appearance-none px-3 py-1 rounded-lg text-[12px] font-bold border-none ${statusConfig[task.status === 'EDITOR_DONE' ? 'pending' : task.status].bg} ${statusConfig[task.status === 'EDITOR_DONE' ? 'pending' : task.status].color}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {task.roleNotes && task.roleNotes.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes:</p>
                      {task.roleNotes.map((note, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-slate-700">{note.role} Notes: {note.author}</span>
                            <span className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[12px] text-slate-600 italic">"{note.message}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {task.screenshot && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Campaign Delivery:</p>
                      <div className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100 max-w-[240px]">
                        <div className="aspect-[4/3] w-full">
                          <img 
                            src={task.screenshot} 
                            alt="Campaign Screenshot" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a 
                            href={task.screenshot} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full text-slate-900 shadow-lg hover:scale-110 transition-transform"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {task.budget > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-2">
                        <span>Budget Progress</span>
                        <span>{spendPct}% Spent</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-orange-500 transition-all" style={{ width: `${spendPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-slate-600">${task.spent.toLocaleString()} / ${task.budget.toLocaleString()}</span>
                        <span className="text-slate-900 font-bold">{task.leads} Leads</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                      <Calendar size={14} /> {formatDeadline(task.deadline)}
                    </div>
                    {task.assignedTo && (
                      <div className="text-[11px] text-slate-400 italic">Assigned to: {task.assignedTo}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Complete Campaign">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1">Screenshot Link</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-[13px]"
                value={screenshot}
                onChange={(e) => setScreenshot(e.target.value)}
              />
              {formErrors.screenshot && <p className="text-red-500 text-[11px] mt-1">{formErrors.screenshot}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-[13px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button onClick={handleFinalSubmit} className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-bold">
              Finalize Campaign
            </button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
