'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Video, Search, Filter, Plus, Calendar as CalendarIcon, LayoutGrid, List, Timer, CheckCircle2 } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, Reel } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import Modal from '@/components/ui/Modal';
import { toast, Toaster } from 'sonner';
import { reelService } from '@/lib/services/reelService';
import { reelAgent } from '@/lib/agent/reelAgent';
import ReelsSchedule from './components/ReelsSchedule';

export default function SocialMediaManagerDashboardPage() {
  useRoleGuard(['Owner', 'Social Media Manager', 'Manager']);
  const { user } = useAuth();
  
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReelForm, setNewReelForm] = useState({ title: '', campaignId: '', scheduledDate: '' });

  useEffect(() => {
    setMounted(true);
    const fetchReels = async () => {
      if (user) {
        setIsLoading(true);
        const data = await reelService.getReelsByUserId(user.id);
        setReels(data);
        setIsLoading(false);
      }
    };
    fetchReels();
  }, [user]);

  const transformedTasks = useMemo(() => {
    return reelAgent.transformToTasks(reels, user);
  }, [reels, user]);

  const filteredAndGroupedReels = useMemo(() => {
    let filtered = transformedTasks;

    if (activeTab !== 'all') {
      filtered = filtered.filter(t => t.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.campaign.toLowerCase().includes(q) ||
        (t.clientName && t.clientName.toLowerCase().includes(q))
      );
    }

    return reelAgent.groupReelsByDate(filtered);
  }, [transformedTasks, activeTab, searchQuery]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const stats = useMemo(() => ({
    pending: transformedTasks.filter((t) => t.status === 'pending').length,
    inProgress: transformedTasks.filter((t) => t.status === 'in_progress').length,
    completed: transformedTasks.filter((t) => t.status === 'completed').length,
  }), [transformedTasks]);

  const onCompleteTask = useCallback((taskId: string) => {
    setReels(prev => prev.map(r => r.id === taskId ? { ...r, status: 'Upload' } : r));
    toast.success('Reel marked as uploaded!');
  }, []);

  const handleStatusChange = useCallback((task: Task, newStatus: TaskStatus) => {
    if (newStatus === 'completed') {
      if (task.status === 'completed') return;
      
      if (task.type === 'REEL') {
        onCompleteTask(task.id);
      } else {
        setSelectedTask(task);
        setIsModalOpen(true);
      }
    } else {
      const reelStatus = newStatus === 'in_progress' ? 'Production' : 'Scheduled';
      setReels(prev => prev.map(r => r.id === task.id ? { ...r, status: reelStatus } : r));
    }
  }, [onCompleteTask]);

  const handleAddReel = async () => {
    if (!user) return;
    try {
      const newReel = await reelService.createReel(newReelForm, user);
      setReels(prev => [newReel, ...prev]);
      setIsAddModalOpen(false);
      setNewReelForm({ title: '', campaignId: '', scheduledDate: '' });
      toast.success('New reel added to schedule');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add reel');
    }
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200 text-white">
              <Video size={24} />
            </div>
            <div>
              <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Reels Schedule</h1>
              <p className="text-[13px] text-slate-500 font-medium">Manage and track scheduled reel uploads for your campaigns</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] shadow-md"
          >
            <Plus size={16} />
            Add New Reel
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Upcoming', value: stats.pending, color: 'text-blue-600', bg: 'bg-blue-50', icon: CalendarIcon },
            { label: 'In Production', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-amber-50', icon: Timer },
            { label: 'Uploaded', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[20px] font-black text-slate-900 leading-none">{s.value}</p>
                <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search reels by title or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[13.5px] placeholder-slate-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-violet-600 text-white' : 'bg-violet-100 text-slate-500 hover:bg-violet-200'}`}
              >
                All Reels
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Scheduled
              </button>
              <button 
                onClick={() => setActiveTab('in_progress')}
                className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap ${activeTab === 'in_progress' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Production
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap ${activeTab === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Uploaded
              </button>
            </div>
          </div>
        </div>

        <ReelsSchedule 
          groupedReels={filteredAndGroupedReels}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <TaskCompletionModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onComplete={(taskId) => onCompleteTask(taskId)}
          userRole="Social Media Manager"
          teamMembers={[]}
        />

        <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule New Reel" size="md">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2">Reel Title</label>
              <input 
                type="text"
                placeholder="e.g., Spring Collection Promo #1"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                value={newReelForm.title}
                onChange={(e) => setNewReelForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Client</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all cursor-pointer"
                  value={newReelForm.campaignId}
                  onChange={(e) => setNewReelForm(f => ({ ...f, campaignId: e.target.value }))}
                >
                  <option value="">Select client...</option>
                  <option value="c_spring">Luma Apparel</option>
                  <option value="c_cyber">TechWorld</option>
                  <option value="c_gt">Velocity Motors</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Schedule Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                  value={newReelForm.scheduledDate}
                  onChange={(e) => setNewReelForm(f => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddReel}
                className="px-6 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-[13px] font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Schedule Reel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
