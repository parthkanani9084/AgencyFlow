'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Camera, CheckCircle2, Timer, Circle, Calendar, ChevronRight, ArrowRight, UserPlus, Info } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface ShooterTask {
  id: string;
  title: string;
  client: string;
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  workflowStage: number;
  notes?: string;
  assignedTo?: string;
  nextRole?: string;
}

const teamMembers = [
  { id: 'tm1', name: 'John Doe', role: 'Editor' },
  { id: 'tm2', name: 'Jane Smith', role: 'Ads Manager' },
  { id: 'tm3', name: 'Amara Diallo', role: 'Editor' },
  { id: 'tm4', name: 'Jin Park', role: 'Editor' },
  { id: 'tm5', name: 'Sofia Nguyen', role: 'Ads Manager' },
];

const shooterTasks: ShooterTask[] = [
  {
    id: 'st1',
    title: 'Shoot product photos for NovaBrew launch',
    client: 'Jordan Lee',
    campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-15',
    status: 'in_progress',
    priority: 'high',
    description: 'Capture 20+ product shots in studio setup. Include lifestyle and flat-lay compositions.',
    workflowStage: 1,
  },
  {
    id: 'st2',
    title: 'Shoot behind-the-scenes for LuxeHome',
    client: 'Mia Tanaka',
    campaign: 'LuxeHome Interior Series',
    deadline: '2026-04-22',
    status: 'pending',
    priority: 'medium',
    description: 'Document the interior styling process. Capture 3-4 rooms with natural lighting.',
    workflowStage: 1,
  },
  {
    id: 'st3',
    title: 'Shoot event coverage for GreenRoot',
    client: 'Ethan Patel',
    campaign: 'GreenRoot Awareness',
    deadline: '2026-04-12',
    status: 'pending',
    priority: 'medium',
    description: 'Cover the GreenRoot pop-up event. Capture crowd, products, and key moments.',
    workflowStage: 2,
  },
  {
    id: 'st4',
    title: 'Shoot PulseWear lifestyle content',
    client: 'Samantha Cruz',
    campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-28',
    status: 'pending',
    priority: 'low',
    description: 'Capture athletes wearing PulseWear gear in outdoor settings.',
    workflowStage: 1,
  },
];

const workflowStages = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
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
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function ShooterDashboardPage() {
  useRoleGuard(['Owner', 'Shooter']);
  const [tasks, setTasks] = useState<ShooterTask[]>(shooterTasks);
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ShooterTask | null>(null);
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const handleStatusChange = (task: ShooterTask, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setStep(1);
      setNotes('');
      setSendTo('');
      setFormErrors({});
      setIsModalOpen(true);
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    }
  };

  const handleFinalSubmit = () => {
    const errors: Record<string, string> = {};
    if (!notes.trim()) errors.notes = 'Notes are required';
    if (!sendTo) errors.sendTo = 'Please select a team member';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (selectedTask) {
      const selectedMember = teamMembers.find(m => m.id === sendTo);
      
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id 
          ? { 
              ...t, 
              status: 'completed',
              notes: notes,
              assignedTo: selectedMember?.name,
              nextRole: selectedMember?.role
            } 
          : t
      ));
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

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
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm col-span-1">
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
              const isDone = idx < 0;
              return (
                <React.Fragment key={stage}>
                  <div className={`flex-1 text-center`}>
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-blue-500' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-500 mt-3">Your role: <span className="font-semibold text-blue-700">Shooting</span> — complete your tasks to advance campaigns to the editing stage.</p>
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
            {tasks.filter(t => t.status === activeTab).length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <p className="text-[13px] text-slate-400 font-medium font-inter">No tasks found in {activeTab.replace('_', ' ')}</p>
              </div>
            ) : (
              tasks.filter(t => t.status === activeTab).map((task) => {
                const overdue = isOverdue(task.deadline, task.status);
                const daysLeft = getDaysLeft(task.deadline);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl border shadow-sm p-4 ${overdue ? 'border-red-200' : 'border-slate-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} style={{ marginTop: 6 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-slate-900 truncate">{task.title}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{task.client} · {task.campaign}</p>
                          <p className="text-[12px] text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                          className={`appearance-none pl-2.5 pr-8 py-1 rounded-lg text-[12px] font-medium transition-all cursor-pointer outline-none border-none ${statusConfig[task.status].bg} ${statusConfig[task.status].color} hover:opacity-80`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" size={12} />
                      </div>
                    </div>
                    
                    {isCompleted && task.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[12px] text-slate-500 font-semibold">Notes:</p>
                        <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{task.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                      <div className={`flex items-center gap-1.5 text-[12px] ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                        <Calendar size={12} />
                        {overdue ? 'Overdue · ' : ''}{formatDeadline(task.deadline)}
                        {!overdue && !isCompleted && (
                          <span className={`ml-1 ${daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                            ({daysLeft > 0 ? `${daysLeft}d left` : 'Today'})
                          </span>
                        )}
                      </div>
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                          <CheckCircle2 size={12} />
                          {task.assignedTo ? `Passed to ${task.assignedTo} (${task.nextRole})` : 'Passed to Editor'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completion Flow Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Complete Task"
          subtitle={selectedTask?.title}
          size="md"
        >
          <div className="p-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Submission Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide details like file locations, Drive links, or specific instructions for the next person."
                  className={`w-full px-4 py-3 rounded-xl border text-[13.5px] outline-none transition-all resize-none ${
                    formErrors.notes ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-4 focus:ring-violet-50 focus:border-violet-300'
                  }`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {formErrors.notes && (
                  <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1">
                    <Info size={12} /> {formErrors.notes}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Send Forward To <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserPlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-[13.5px] outline-none transition-all appearance-none bg-white ${
                      formErrors.sendTo ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-4 focus:ring-violet-50 focus:border-violet-300'
                    }`}
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                  >
                    <option value="">Select team member…</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
                </div>
                {formErrors.sendTo && (
                  <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1">
                    <Info size={12} /> {formErrors.sendTo}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-md shadow-violet-100 transition-all active:scale-[0.98]"
                >
                  Complete Task <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
