'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Film, 
  Timer, 
  CheckCircle2, 
  ChevronRight, 
  LayoutGrid, 
  Calendar 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetReels } from '@/api/hooks/useReel';
import { Task, TaskStatus, Reel } from '@/types';
import Badge from '@/components/ui/Badge';
import { STATIC_STRINGS } from '@/utils/constants';

export default function ClientReelsPage() {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');

  const { data: reelsData, isLoading } = useGetReels({
    page: 1,
    limit: 100,
  });

  const reels = useMemo(() => {
    return reelsData?.results?.data || [];
  }, [reelsData]);

  const transformedTasks = useMemo(() => {
    if (!user) return [];

    return reels
      .filter((reel) => {
        const clientName = reel.client?.brandName || reel.clientName;
        const isClientForThisReel = clientName === user.name;
        return isClientForThisReel;
      })
      .map((reel) => {
        const date = reel.publishDate || new Date().toISOString();

        let taskStatus: TaskStatus = 'pending';
        const rawStatus = reel.status?.toLowerCase();
        if (rawStatus === 'uploaded') taskStatus = 'completed';
        else if (rawStatus === 'production') taskStatus = 'in_progress';
        else if (rawStatus === 'schedule') taskStatus = 'pending';

        return {
          id: reel.id,
          title: reel.title,
          assignedTo: user.name,
          role: 'Social Media Manager',
          client: 'AgencyFlow',
          campaign: 'Social Media Strategy',
          campaignId: reel.clientId || reel.campaignId,
          deadline: date,
          status: taskStatus,
          priority: 'medium',
          type: 'REEL',
          scheduledDate: date,
          clientName: user.name,
        } as Task;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [reels, user]);

  const filteredAndGroupedReels = useMemo(() => {
    let filtered = [...transformedTasks];

    if (activeTab !== 'all') {
      filtered = filtered.filter((t) => t.status === activeTab);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) || t.campaign?.toLowerCase().includes(query)
      );
    }

    const groups: Record<string, Task[]> = {};

    filtered.forEach((task) => {
      const date = new Date(task.deadline).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    });

    return Object.entries(groups).map(([date, reels]) => ({
      date,
      reels: reels.sort((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [transformedTasks, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const counts = {
      pending: transformedTasks.filter(t => t.status === 'pending').length,
      inProgress: transformedTasks.filter(t => t.status === 'in_progress').length,
      completed: transformedTasks.filter(t => t.status === 'completed').length,
    };
    
    return [
      { id: 'pending', label: STATIC_STRINGS.CLIENT_REELS_SCHEDULED, count: counts.pending, icon: Calendar, color: 'text-slate-500', bg: 'bg-slate-50' },
      { id: 'in_progress', label: STATIC_STRINGS.CLIENT_REELS_PRODUCTION, count: counts.inProgress, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-50' },
      { id: 'completed', label: STATIC_STRINGS.CLIENT_REELS_UPLOADED, count: counts.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];
  }, [transformedTasks]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        <div className="p-8 max-w-5xl mx-auto">
          
          {/* Dashboard Header */}
          <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.CLIENT_REELS_TITLE}</h1>
              <p className="text-slate-500 mt-1 font-medium">{STATIC_STRINGS.CLIENT_REELS_SUBTITLE}</p>
            </div>
            
            
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Navigation Filters */}
            <aside className="lg:col-span-3">
              <nav className="flex flex-col gap-1 sticky top-8">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} />
                    <span>{STATIC_STRINGS.CLIENT_REELS_ALL}</span>
                  </div>
                  <span className={`text-[11px] ${activeTab === 'all' ? 'text-white/60' : 'text-slate-400'}`}>
                    {transformedTasks.length}
                  </span>
                </button>
                
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <button 
                      key={stat.id}
                      onClick={() => setActiveTab(stat.id as any)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === stat.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{stat.label}</span>
                      </div>
                      <span className={`text-[11px] ${activeTab === stat.id ? 'text-white/60' : 'text-slate-400'}`}>
                        {stat.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Timeline View Content */}
            <section className="lg:col-span-9">
              {isLoading ? (
                <div className="space-y-8" aria-hidden="true">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="w-32 h-4 bg-slate-100 rounded mb-6" />
                      <div className="space-y-4">
                        <div className="h-20 bg-slate-50 rounded-xl" />
                        <div className="h-20 bg-slate-50 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAndGroupedReels.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                  <Film className="mx-auto text-slate-200 mb-4" size={40} />
                  <p className="text-slate-400 font-medium text-[15px]">{STATIC_STRINGS.CLIENT_REELS_NO_REELS}</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredAndGroupedReels.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.date}</h2>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      <div className="grid gap-3">
                        {group.reels.map((reel) => (
                          <article 
                            key={reel.id} 
                            className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reel.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Film size={18} />
                              </div>
                              
                              <div>
                                <h4 className="text-[15px] font-bold text-slate-900">{reel.title}</h4>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[12px] text-slate-400 font-medium">{reel.campaign || STATIC_STRINGS.CLIENT_REELS_GENERAL_CONTENT}</span>
                                  <span className="text-slate-200">/</span>
                                  <span className="text-[12px] text-slate-400 font-medium">
                                    {new Date(reel.deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <Badge 
                                 variant={reel.status === 'completed' ? 'success' : reel.status === 'in_progress' ? 'warning' : 'neutral'}
                                 size="sm"
                                 className="font-bold uppercase tracking-widest opacity-80"
                               >
                                 {reel.status === 'completed' ? STATIC_STRINGS.CLIENT_REELS_UPLOADED : reel.status === 'in_progress' ? STATIC_STRINGS.CLIENT_REELS_PRODUCTION : STATIC_STRINGS.CLIENT_REELS_SCHEDULED}
                               </Badge>
                              
                              <button className="text-slate-300 hover:text-slate-900 transition-colors" aria-label="View Reel Details">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
