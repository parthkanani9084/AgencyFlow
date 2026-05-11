import React from 'react';
import { Pencil, Trash2, ChevronDown, Loader2, ClipboardList } from 'lucide-react';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { ROLE_CONFIG, STATUS_CONFIG } from '@/utils/ui-configs';
import { Task, TaskStatus } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  isRestricted: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  totalEntries: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  checkIsOverdue: (deadline: string, status: TaskStatus) => boolean;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  isLoading,
  isRestricted,
  page,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  totalEntries,
  onEdit,
  onDelete,
  onStatusChange,
  checkIsOverdue,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_TASK}</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_ASSIGNED_TO}</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_CLIENT}</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_DEADLINE}</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TASK_MGMT_COL_STATUS}</th>
            {!isRestricted && <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.TASK_MGMT_COL_ACTIONS}</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-5 py-24 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-violet-600 animate-spin opacity-80" />
                  <p className="text-[13px] text-slate-500 font-medium animate-pulse">
                    {STATIC_STRINGS.BA_LOADING}
                  </p>
                </div>
              </td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-20 text-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ClipboardList size={36} className="opacity-20 mb-1" />
                  <p className="text-[13.5px] font-medium text-slate-500">{STATIC_STRINGS.TASK_MGMT_NO_TASKS}</p>
                </div>
              </td>
            </tr>
          ) : (
            tasks.map((task: Task) => {
              const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
              const roleCfg = ROLE_CONFIG[task.role] || ROLE_CONFIG[ROLES.SHOOTER];
              const RoleIcon = roleCfg.icon;
              const overdue = checkIsOverdue(task.deadline, task.status as TaskStatus);

              return (
                <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <p className={`text-[13.5px] font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12.5px] text-slate-700">{task.assignedTo || STATIC_STRINGS.COMMON_UNASSIGNED}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${roleCfg.bg} ${roleCfg.color}`}>
                      <RoleIcon size={10} />
                      {task.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[12.5px] font-semibold text-slate-700 truncate">{task.client}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[12.5px] ${overdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{task.deadline}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="relative inline-block group">
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all border-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${statusCfg.bg} ${statusCfg.color} hover:brightness-95`}
                      >
                        <option value="pending" className="bg-white text-slate-700">{STATIC_STRINGS.TASK_MGMT_PENDING}</option>
                        <option value="in_progress" className="bg-white text-slate-700">{STATIC_STRINGS.TASK_MGMT_IN_PROGRESS}</option>
                        <option value="completed" className="bg-white text-slate-700">{STATIC_STRINGS.TASK_MGMT_COMPLETED}</option>
                      </select>
                      <ChevronDown size={10} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 ${statusCfg.color}`} />
                    </div>
                  </td>
                  {!isRestricted && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        totalEntries={totalEntries}
        labels={{
          show: STATIC_STRINGS.TASK_MGMT_PAGINATION_SHOW,
          of: STATIC_STRINGS.TASK_MGMT_PAGINATION_OF,
          entries: STATIC_STRINGS.TASK_MGMT_PAGINATION_ENTRIES
        }}
      />
    </div>
  );
};

export default TaskTable;
