import React from 'react';
import { ROLE_CONFIG } from '@/utils/ui-configs';
import { UserRole } from '@/types';

interface TeamStatsProps {
  stats: {
    byRole: { role: UserRole; count: number }[];
  };
}

export const TeamStats = React.memo(({ stats }: TeamStatsProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
    {stats.byRole.map(({ role, count }) => {
      const cfg = ROLE_CONFIG[role];
      const Icon = cfg.icon;
      return (
        <div key={role} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon size={15} className={cfg.color} />
          </div>
          <div>
            <p className="text-[18px] font-bold text-slate-900 tabular-nums">{count}</p>
            <p className="text-[11px] text-slate-500 truncate">{role}</p>
          </div>
        </div>
      );
    })}
  </div>
));

TeamStats.displayName = 'TeamStats';
