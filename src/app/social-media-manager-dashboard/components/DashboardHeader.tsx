'use client';

import React from 'react';
import { Video, Plus } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';

interface DashboardHeaderProps {
  onAddReel: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddReel }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200 text-white">
          <Video size={24} />
        </div>

        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            {STATIC_STRINGS.SMM_DASHBOARD_TITLE}
          </h1>

          <p className="text-[13px] text-slate-500 font-medium">
            {STATIC_STRINGS.SMM_DASHBOARD_DESC}
          </p>
        </div>
      </div>

      <button
        onClick={onAddReel}
        className="inline-flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] shadow-md"
      >
        <Plus size={16} />
        {STATIC_STRINGS.SMM_ADD_REEL}
      </button>
    </div>
  );
};

export default DashboardHeader;
