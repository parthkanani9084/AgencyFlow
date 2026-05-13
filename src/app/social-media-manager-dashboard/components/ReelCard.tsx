import React, { useMemo } from 'react';
import { ChevronRight, Video, Building2 } from 'lucide-react';
import { Reel } from '@/types';
import { STATIC_STRINGS, REEL_STATUSES, REEL_CONSTANTS } from '@/utils/constants';
import { REEL_STATUS_CONFIG } from '@/utils/ui-configs';

interface ReelCardProps {
  reel: Reel;
  onStatusChange: (reel: Reel, newStatus: string) => void;
}

export default function ReelCard({ reel, onStatusChange }: ReelCardProps) {
  const config = useMemo(() => 
    REEL_STATUS_CONFIG[reel.status] || REEL_STATUS_CONFIG[REEL_STATUSES.SCHEDULED],
  [reel.status]);

  const isDueSoon = REEL_CONSTANTS.DUE_SOON_KEYWORDS.some(keyword => 
    reel.deadline_status?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div 
      className={`group relative flex items-center gap-4 p-3.5 rounded-xl border transition-all hover:shadow-md ${
        reel.status === REEL_STATUSES.UPLOADED 
          ? 'bg-emerald-50/20 border-emerald-100/50' 
          : isDueSoon 
            ? 'bg-white border-orange-200 shadow-sm shadow-orange-50' 
            : 'bg-white border-slate-100 hover:border-violet-200'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${reel.status === REEL_STATUSES.UPLOADED ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors'}`}>
        <Video size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-[14px] font-bold text-slate-900 truncate">{reel.title}</h4>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[12px] text-slate-500 truncate font-medium flex items-center gap-1.5">
            <Building2 size={12} className="text-slate-400" />
            {reel.client?.brandName || reel.client?.clientName || STATIC_STRINGS.SMM_PRIVATE_CLIENT}
          </p>
          {reel.deadline_status && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDueSoon ? 'text-orange-600 bg-orange-50' : 'text-slate-400 bg-slate-50'}`}>
              {reel.deadline_status}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${config.bg} ${config.color}`}>
            <config.icon size={12} />
            {config.label}
          </div>
        </div>

        <div className="relative">
          <select
            value={reel.status}
            onChange={(e) => onStatusChange(reel, e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full text-[11px]"
          >
            <option value={REEL_STATUSES.SCHEDULED}>{STATIC_STRINGS.SMM_TAB_SCHEDULED}</option>
            <option value={REEL_STATUSES.PRODUCTION}>{STATIC_STRINGS.SMM_TAB_PRODUCTION}</option>
            <option value={REEL_STATUSES.UPLOADED}>{STATIC_STRINGS.SMM_TAB_UPLOADED}</option>
          </select>
          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-violet-200 group-hover:text-violet-500 transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
