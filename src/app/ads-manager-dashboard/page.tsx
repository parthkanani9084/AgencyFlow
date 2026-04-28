'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Megaphone, CheckCircle2, Timer, Circle, Calendar, ChevronRight, TrendingUp, DollarSign, Upload, Info, ExternalLink } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface AdsTask {
  id: string;
  title: string;
  client: string;
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  platform: string;
  budget: number;
  spent: number;
  leads: number;
  screenshot?: string;
  notes?: string;
  previousNotes?: string;
}

const adsTasks: AdsTask[] = [
  {
    id: 'at1',
    title: 'Run Meta ads for GreenRoot campaign',
    client: 'Ethan Patel',
    campaign: 'GreenRoot Awareness',
    deadline: '2026-04-20',
    status: 'in_progress',
    priority: 'medium',
    description: 'Set up and launch Meta ad sets. Budget: $2,000. Target: eco-conscious 25-40 demographic.',
    platform: 'Meta',
    budget: 2000,
    spent: 840,
    leads: 62,
    previousNotes: 'Videos are edited with high contrast as requested. Please use the V2 version for the main feed ads.',
  },
  {
    id: 'at2',
    title: 'Launch Google Ads for PulseWear',
    client: 'Samantha Cruz',
    campaign: 'PulseWear Q2 Reel',
    deadline: '2026-04-28',
    status: 'completed',
    priority: 'low',
    description: 'Set up search and display campaigns. Track conversions via GA4.',
    platform: 'Google',
    budget: 1500,
    spent: 1500,
    leads: 118,
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    notes: 'Campaign performing well. CPC is lower than expected.',
    previousNotes: 'Make sure to target the specific keywords listed in the strategy doc. All assets are in the Google Ads folder.',
  },
  {
    id: 'at3',
    title: 'Launch NovaBrew Instagram campaign',
    client: 'Jordan Lee',
    campaign: 'NovaBrew Spring Launch',
    deadline: '2026-04-30',
    status: 'pending',
    priority: 'high',
    description: 'Run Instagram story and feed ads targeting coffee enthusiasts aged 22-35.',
    platform: 'Meta',
    budget: 3000,
    spent: 0,
    leads: 0,
    previousNotes: 'The client wants a very "vibey" feel. Color grading is optimized for mobile screens.',
  },
  {
    id: 'at4',
    title: 'Set up LuxeHome Pinterest ads',
    client: 'Mia Tanaka',
    campaign: 'LuxeHome Interior Series',
    deadline: '2026-05-05',
    status: 'pending',
    priority: 'medium',
    description: 'Create Pinterest promoted pins targeting home decor enthusiasts.',
    platform: 'Pinterest',
    budget: 1200,
    spent: 0,
    leads: 0,
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

function getDaysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export default function AdsManagerDashboardPage() {
  useRoleGuard(['Owner', 'Ads Manager']);
  const [tasks, setTasks] = useState<AdsTask[]>(adsTasks);
  const [activeTab, setActiveTab] = useState<TaskStatus>('in_progress');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AdsTask | null>(null);
  const [screenshot, setScreenshot] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const totalSpent = tasks.reduce((sum, t) => sum + t.spent, 0);
  const totalLeads = tasks.reduce((sum, t) => sum + t.leads, 0);

  const handleStatusChange = (task: AdsTask, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      setSelectedTask(task);
      setScreenshot('');
      setNotes('');
      setFormErrors({});
      setIsModalOpen(true);
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!screenshot.trim()) {
      errors.screenshot = 'Screenshot link is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinalSubmit = () => {
    if (validate() && selectedTask) {
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id 
          ? { 
              ...t, 
              status: 'completed',
              screenshot: screenshot,
              notes: notes || undefined
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
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Megaphone size={20} className="text-orange-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Ads Manager Dashboard</h1>
            <p className="text-[13px] text-slate-500">Sofia Nguyen · Ads Team</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Pending', value: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm col-span-1">
              <p className={`text-[24px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Ad Performance Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign size={17} className="text-green-600" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
              <p className="text-[12px] text-slate-500">Total Ad Spend</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp size={17} className="text-violet-600" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-900">{totalLeads}</p>
              <p className="text-[12px] text-slate-500">Total Leads Generated</p>
            </div>
          </div>
        </div>

        {/* Workflow Stage Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-4">Workflow Stage Overview</h2>
          <div className="flex items-center gap-1">
            {workflowStages.map((stage, idx) => {
              const isActive = idx === 3;
              const isDone = idx < 3;
              return (
                <React.Fragment key={stage}>
                  <div className="flex-1 text-center">
                    <div className={`h-2 rounded-full mb-2 ${isActive ? 'bg-orange-500' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[11px] font-medium ${isActive ? 'text-orange-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>{stage}</span>
                  </div>
                  {idx < workflowStages.length - 1 && (
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-500 mt-3">Your role: <span className="font-semibold text-orange-700">Ads</span> — run campaigns and input performance data to complete the workflow.</p>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-800">Assigned Campaigns</h2>
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
                <p className="text-[13px] text-slate-400 font-medium font-inter">No campaigns found in {activeTab.replace('_', ' ')}</p>
              </div>
            ) : (
              tasks.filter(t => t.status === activeTab).map((task) => {
                const overdue = isOverdue(task.deadline, task.status);
                const daysLeft = getDaysLeft(task.deadline);
                const platform = platformColors[task.platform] ?? { color: 'text-slate-700', bg: 'bg-slate-100' };
                const spendPct = task.budget > 0 ? Math.min(100, Math.round((task.spent / task.budget) * 100)) : 0;
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-semibold text-slate-900">{task.title}</p>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${platform.bg} ${platform.color}`}>{task.platform}</span>
                          </div>
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

                    {/* Previous Notes (from Editor) */}
                    {task.previousNotes && (
                      <div className="mt-3 p-2.5 bg-violet-50/50 rounded-lg border border-violet-100 flex gap-2">
                        <div className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-violet-700">ED</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-violet-800">Notes from Editor</p>
                          <p className="text-[11px] text-violet-600/90 leading-relaxed mt-0.5">{task.previousNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Budget Progress */}
                    {task.budget > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-slate-500">Budget: ${task.budget.toLocaleString()}</span>
                          <span className="text-[11px] font-medium text-slate-700">${task.spent.toLocaleString()} spent · {task.leads} leads</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${spendPct >= 90 ? 'bg-red-500' : spendPct >= 60 ? 'bg-amber-400' : 'bg-orange-400'}`}
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completion Data Display */}
                    {(task.screenshot || task.notes) && isCompleted && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                        {task.screenshot && (
                          <>
                            <p className="text-[12px] text-slate-500 font-semibold tracking-tight">Screenshot:</p>
                            <div className="relative group w-full max-w-[160px]">
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:border-orange-300">
                                <img 
                                  src={task.screenshot} 
                                  alt="Campaign Screenshot" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement?.classList.add('bg-slate-100');
                                  }}
                                />
                                <a 
                                  href={task.screenshot} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white gap-1.5"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {task.notes && (
                          <div className={task.screenshot ? 'mt-1' : ''}>
                            <p className="text-[12px] text-slate-500 font-semibold tracking-tight">Notes:</p>
                            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{task.notes}</p>
                          </div>
                        )}
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completion Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Complete Campaign"
          subtitle={selectedTask?.title}
          size="md"
        >
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Upload Screenshot <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setScreenshot(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                  screenshot ? 'border-orange-400 bg-orange-50/30' : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                }`}>
                  {screenshot ? (
                    <div className="flex flex-col items-center">
                      <img src={screenshot} alt="Selected" className="w-32 h-20 object-cover rounded-lg border border-orange-200 mb-2 shadow-sm" />
                      <p className="text-[12px] text-orange-600 font-medium">Image Selected — Click to change</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                        <Upload size={18} className="text-orange-600" />
                      </div>
                      <p className="text-[13px] text-slate-600 font-medium">Click or drag to upload screenshot</p>
                      <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or WebP up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {formErrors.screenshot && (
                <p className="mt-2 text-[11.5px] text-red-600 flex items-center gap-1">
                  <Info size={12} /> {formErrors.screenshot}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any final performance notes, observations, or handover details..."
                className="w-full h-24 text-[13px] border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all resize-none placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[13px] font-semibold transition-all shadow-sm"
              >
                Complete Campaign <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
