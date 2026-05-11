import { STATIC_STRINGS, TASK_ROLE_FILTERS, TASK_MGMT_KEYS, TASK_STATUSES } from '@/utils/constants';
import { ROLE_CONFIG } from '@/utils/ui-configs';
import { TaskRole, TaskStatus } from '@/types';
import { normalizeRole } from '@/utils/roles';
import { ChevronDown, Search } from 'lucide-react';

interface TaskFiltersProps {
  roleFilter: TaskRole | typeof TASK_STATUSES.ALL;
  setRoleFilter: (role: TaskRole | typeof TASK_STATUSES.ALL) => void;
  statusFilter: TaskStatus | typeof TASK_STATUSES.ALL;
  setStatusFilter: (status: TaskStatus | typeof TASK_STATUSES.ALL) => void;
  search: string;
  setSearch: (search: string) => void;
  isRestricted: boolean;
  userRole?: string;
  setPage: (page: number) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  isRestricted,
  userRole,
  setPage,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit overflow-x-auto no-scrollbar">
        {TASK_ROLE_FILTERS
          .filter(rf => !isRestricted || rf.value === normalizeRole(userRole || ''))
          .map((rf) => {
            const isActive = roleFilter === rf.value;
            const cfg = rf.value !== TASK_STATUSES.ALL ? ROLE_CONFIG[rf.value] : null;
            const RoleIcon = cfg?.icon;
            return (
              <button
                key={rf.value}
                onClick={() => { setRoleFilter(rf.value as any); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap ${isActive
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {RoleIcon && <RoleIcon size={14} />}
                {rf.label}
              </button>
            );
          })}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-auto">
          <select
            id={TASK_MGMT_KEYS.STATUS_FILTER_ID}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer hover:border-slate-300 transition-all"
          >
            <option value={TASK_STATUSES.ALL}>{STATIC_STRINGS.TASK_MGMT_ALL_STATUSES}</option>
            <option value={TASK_STATUSES.PENDING}>{STATIC_STRINGS.TASK_MGMT_PENDING}</option>
            <option value={TASK_STATUSES.IN_PROGRESS}>{STATIC_STRINGS.TASK_MGMT_IN_PROGRESS}</option>
            <option value={TASK_STATUSES.COMPLETED}>{STATIC_STRINGS.TASK_MGMT_COMPLETED}</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={TASK_MGMT_KEYS.SEARCH_ID}
            type="text"
            placeholder={STATIC_STRINGS.TASK_MGMT_SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-full sm:w-48 lg:w-64 transition-all hover:border-slate-300"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
