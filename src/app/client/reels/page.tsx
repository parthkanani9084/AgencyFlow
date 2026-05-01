'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Film, 
  Calendar as CalendarIcon, 
  Timer, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  Calendar 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { reelService } from '@/lib/services/reelService';
import { reelAgent } from '@/lib/agent/reelAgent';
import { Task, Reel } from '@/types';
import Badge from '@/components/ui/Badge';

export default function ClientReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, we'd fetch by clientId. 
        // For demo, we fetch all and filter by user name which matches client name.
        const allReels = await reelService.getReelsByUserId('any'); 
        const clientReels = allReels.filter(r => r.clientName === user?.name);
        setReels(clientReels);
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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
        t.campaign?.toLowerCase().includes(q)
      );
    }
    return reelAgent.groupReelsByDate(filtered);
  }, [transformedTasks, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = transformedTasks.length;
    const pending = transformedTasks.filter(t => t.status === 'pending').length;
    const inProgress = transformedTasks.filter(t => t.status === 'in_progress').length;
    const completed = transformedTasks.filter(t => t.status === 'completed').length;
    
    return [
      { label: 'Scheduled', count: pending, icon: Calendar, color: 'text-slate-500', bg: 'bg-slate-50' },
      { label: 'Production', count: inProgress, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Uploaded', count: completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];
  }, [transformedTasks]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Simple Professional Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reels Schedule</h1>
              <p className="text-slate-500 mt-1 font-medium">Production pipeline & upload calendar</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search reels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all w-64 text-[14px]"
                />
              </div>
            </div>
          </div>



          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Filter Tabs */}
            <div className="lg:col-span-3">
              <nav className="flex flex-col gap-1 sticky top-8">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} />
                    <span>All Reels</span>
                  </div>
                  <span className={`text-[11px] ${activeTab === 'all' ? 'text-white/60' : 'text-slate-400'}`}>{transformedTasks.length}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={16} />
                    <span>Scheduled</span>
                  </div>
                  <span className={`text-[11px] ${activeTab === 'pending' ? 'text-white/60' : 'text-slate-400'}`}>{stats[0].count}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('in_progress')}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === 'in_progress' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Timer size={16} />
                    <span>Production</span>
                  </div>
                  <span className={`text-[11px] ${activeTab === 'in_progress' ? 'text-white/60' : 'text-slate-400'}`}>{stats[1].count}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${activeTab === 'completed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} />
                    <span>Uploaded</span>
                  </div>
                  <span className={`text-[11px] ${activeTab === 'completed' ? 'text-white/60' : 'text-slate-400'}`}>{stats[2].count}</span>
                </button>


              </nav>
            </div>

            {/* Timeline Content */}
            <div className="lg:col-span-9">
              {isLoading ? (
                <div className="space-y-8">
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
                  <p className="text-slate-400 font-medium text-[15px]">No reels found matching your selection.</p>
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
                          <div 
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
                                  <span className="text-[12px] text-slate-400 font-medium">{reel.campaign || 'General Content'}</span>
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
                                {reel.status === 'completed' ? 'Uploaded' : reel.status === 'in_progress' ? 'Production' : 'Scheduled'}
                              </Badge>
                              
                              <button className="text-slate-300 hover:text-slate-900 transition-colors">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>

  );
}

