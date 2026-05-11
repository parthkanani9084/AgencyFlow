import { Search, X } from 'lucide-react';
import { STATIC_STRINGS, COMMON_STATUS } from '@/utils/constants';
import { UserRole } from '@/types';
import React from 'react';

interface TeamFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  roleFilter: UserRole | typeof COMMON_STATUS.ALL;
  setRoleFilter: (val: UserRole | typeof COMMON_STATUS.ALL) => void;
  allRoles: UserRole[];
}

export const TeamFilters = React.memo(({ 
  search, 
  setSearch, 
  roleFilter, 
  setRoleFilter, 
  allRoles 
}: TeamFiltersProps) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={STATIC_STRINGS.TEAM_PAGE_SEARCH_PLACEHOLDER}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-8 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
      />
      {search && (
        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      )}
    </div>
    <div className="flex gap-1.5 flex-wrap">
      <button
        onClick={() => setRoleFilter(COMMON_STATUS.ALL)}
        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
          roleFilter === COMMON_STATUS.ALL ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {STATIC_STRINGS.NOTIFICATIONS_ALL}
      </button>
      {allRoles.map((r) => (
        <button
          key={r}
          onClick={() => setRoleFilter(r)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
            roleFilter === r ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  </div>
));

TeamFilters.displayName = 'TeamFilters';
