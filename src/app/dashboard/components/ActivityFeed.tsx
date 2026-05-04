'use client';

import React from 'react';
import { CheckCircle2, Upload, Play, AlertCircle, UserPlus, Clock } from 'lucide-react';


interface ActivityItem {
  id: string;
  type: 'task_complete' | 'file_upload' | 'ads_live' | 'overdue' | 'assigned' | 'deadline';
  user: string;
  userInitials: string;
  userColor: string;
  message: string;
  campaign: string;
  timeAgo: string;
}


const ICON_MAP = {
  task_complete: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  file_upload: { icon: Upload, color: 'text-violet-500 bg-violet-50' },
  ads_live: { icon: Play, color: 'text-blue-500 bg-blue-50' },
  overdue: { icon: AlertCircle, color: 'text-red-500 bg-red-50' },
  assigned: { icon: UserPlus, color: 'text-amber-500 bg-amber-50' },
  deadline: { icon: Clock, color: 'text-orange-500 bg-orange-50' },
};

const ACTIVITIES: ActivityItem[] = [
  { id: 'act-001', type: 'ads_live', user: 'Sofia Nguyen', userInitials: 'SN', userColor: 'bg-rose-400', message: 'launched Meta ads campaign', campaign: 'Spring Collection Launch', timeAgo: '4m ago' },
  { id: 'act-002', type: 'task_complete', user: 'Jin Park', userInitials: 'JP', userColor: 'bg-amber-400', message: 'completed editing for', campaign: 'Q2 Lead Gen Drive', timeAgo: '22m ago' },
  { id: 'act-003', type: 'file_upload', user: 'Marco Reyes', userInitials: 'MR', userColor: 'bg-emerald-500', message: 'uploaded 14 raw clips for', campaign: 'Summer Sale Blitz', timeAgo: '1h ago' },
  { id: 'act-004', type: 'overdue', user: 'System', userInitials: 'AF', userColor: 'bg-red-400', message: 'Editing task overdue for', campaign: 'B2B Awareness Push', timeAgo: '2h ago' },
  { id: 'act-005', type: 'assigned', user: 'Priya Sharma', userInitials: 'PS', userColor: 'bg-blue-400', message: 'auto-assigned editing task for', campaign: 'Reactivation Campaign', timeAgo: '3h ago' },
  { id: 'act-006', type: 'task_complete', user: 'Marco Reyes', userInitials: 'MR', userColor: 'bg-emerald-500', message: 'completed shooting for', campaign: 'Product Reveal Reel', timeAgo: '5h ago' },
  { id: 'act-007', type: 'deadline', user: 'System', userInitials: 'AF', userColor: 'bg-orange-400', message: 'Deadline in 18h for', campaign: 'Coral Beauty Launch', timeAgo: '6h ago' },
  { id: 'act-008', type: 'file_upload', user: 'Jin Park', userInitials: 'JP', userColor: 'bg-amber-400', message: 'submitted final edit for', campaign: 'Nexus Capital Q2', timeAgo: '8h ago' },
];

export default function ActivityFeed() {
  return (
    <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden h-full flex flex-col">
      <header className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-[14px] font-semibold text-slate-800">Recent Activity</h3>
        <p className="text-[12px] text-slate-400 mt-0.5">Live workflow events</p>
      </header>
      
      <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto scrollbar-thin flex-1">
        {ACTIVITIES.map((item) => {
          const cfg = ICON_MAP[item.type];
          const ActivityIcon = cfg.icon;
          
          return (
            <article 
              key={item.id} 
              className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                <ActivityIcon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-slate-700 leading-snug">
                  <span className="font-semibold">{item.user}</span>{' '}
                  {item.message}{' '}
                  <span className="text-violet-600 font-medium truncate inline-block align-bottom max-w-[140px]">
                    {item.campaign}
                  </span>
                </p>
                <time className="text-[11px] text-slate-400 mt-0.5 block">{item.timeAgo}</time>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}