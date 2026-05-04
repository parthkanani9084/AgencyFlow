'use client';

import React from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { STATIC_STRINGS } from '@/utils/constants';
import ReelCard from './ReelCard';

interface ReelsScheduleProps {
  groupedReels: { date: string; reels: Task[] }[];
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ReelsSchedule({ 
  groupedReels, 
  onStatusChange, 
  isLoading, 

}: ReelsScheduleProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 w-48 bg-slate-100 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-slate-50 rounded-xl border border-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedReels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
          <Calendar size={32} />
        </div>
        <h3 className="text-slate-900 font-bold">{STATIC_STRINGS.SMM_NO_REELS}</h3>
        <p className="text-slate-500 text-[13px] mt-1">{STATIC_STRINGS.SMM_NO_REELS_DESC}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedReels.map((group) => (
        <div key={group.date} className="relative">
          <div className="sticky top-0 z-10 py-3 bg-slate-50/95 backdrop-blur-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                <Calendar size={14} />
              </div>
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">
                {group.date}
              </h3>
              <div className="flex-1 h-px bg-slate-200 ml-2" />
              <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                {group.reels.length} {group.reels.length === 1 ? STATIC_STRINGS.SMM_LABEL_REEL : STATIC_STRINGS.SMM_LABEL_REELS}
              </span>
            </div>
          </div>

          <div className="space-y-3 pl-4 sm:pl-10 relative">
            <div className="absolute left-4 sm:left-4 top-0 bottom-0 w-px bg-slate-200 hidden sm:block" />
            
            {group.reels.map((reel) => (
              <ReelCard 
                key={reel.id} 
                task={reel} 
                onStatusChange={onStatusChange} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
