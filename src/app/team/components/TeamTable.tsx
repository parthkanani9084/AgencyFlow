import { Mail, Pencil, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { STATIC_STRINGS, COMMON_STATUS } from '@/utils/constants';
import { ROLE_CONFIG, ROLE_AVATAR_COLORS } from '@/utils/ui-configs';
import { UserRole } from '@/types';
import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: typeof COMMON_STATUS.ACTIVE | typeof COMMON_STATUS.INACTIVE;
  joinedAt: string;
  tasksCompleted: number;
  tasksActive: number;
}

interface TeamTableProps {
  members: TeamMember[];
  isLoading: boolean;
  onEdit: (m: TeamMember) => void;
  onDelete: (m: TeamMember) => void;
  onToggleStatus: (id: string) => void;
  canManage?: boolean;
}

const MemberRow = React.memo(({ 
  member, 
  idx, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  canManage = true
}: { 
  member: TeamMember; 
  idx: number; 
  onEdit: (m: TeamMember) => void;
  onDelete: (m: TeamMember) => void;
  onToggleStatus: (id: string) => void;
  canManage?: boolean;
}) => {
  const cfg = ROLE_CONFIG[member.role];
  const RoleIcon = cfg.icon;
  const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <tr className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${ROLE_AVATAR_COLORS[member.role]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-[11px] font-bold text-white">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800">{member.name}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Mail size={10} />
              {member.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
          <RoleIcon size={11} />
          {member.role}
        </span>
      </td>
      {/* <td className="px-5 py-3.5 hidden lg:table-cell">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-slate-800 tabular-nums">{member.tasksCompleted}</p>
            <p className="text-[11px] text-slate-400">{STATIC_STRINGS.ADS_DASHBOARD_TASK_TAB_COMPLETED}</p>
          </div>
          <div>
            <p className="font-semibold text-amber-600 tabular-nums">{member.tasksActive}</p>
            <p className="text-[11px] text-slate-400">{STATIC_STRINGS.ADS_STATUS_ACTIVE}</p>
          </div>
        </div>
      </td> */}
      <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{member.joinedAt}</td>
      <td className="px-5 py-3.5">
        <button
          onClick={() => canManage && onToggleStatus(member.id)}
          disabled={!canManage}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            member.status === COMMON_STATUS.ACTIVE 
              ? 'bg-emerald-100 text-emerald-700' + (canManage ? ' hover:bg-emerald-200' : '') 
              : 'bg-slate-100 text-slate-500' + (canManage ? ' hover:bg-slate-200' : '')
          } ${!canManage ? 'cursor-default' : ''}`}
        >
          {member.status === COMMON_STATUS.ACTIVE ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
          {member.status === COMMON_STATUS.ACTIVE ? STATIC_STRINGS.TEAM_PAGE_STATUS_ACTIVE : STATIC_STRINGS.TEAM_PAGE_STATUS_INACTIVE}
        </button>
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {canManage ? (
            <>
              <button
                onClick={() => onEdit(member)}
                className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                title={STATIC_STRINGS.TEAM_PAGE_EDIT_MEMBER_TOOLTIP}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(member)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title={STATIC_STRINGS.TEAM_PAGE_REMOVE_MEMBER_TOOLTIP}
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic pr-2">Read only</span>
          )}
        </div>
      </td>
    </tr>
  );
});

MemberRow.displayName = 'MemberRow';

export const TeamTable = ({ 
  members, 
  isLoading, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  canManage = true
}: TeamTableProps) => {
  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-[13px] text-slate-400">{STATIC_STRINGS.TEAM_PAGE_LOADING}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Users size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-[14px] font-medium">{STATIC_STRINGS.CLIENT_MGMT_NO_CLIENTS}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">{STATIC_STRINGS.TEAM_PAGE_COL_MEMBER}</th>
            <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden md:table-cell">{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</th>
            {/* <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden lg:table-cell">{STATIC_STRINGS.DASHBOARD_ALL_TASKS}</th> */}
            <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">{STATIC_STRINGS.TEAM_PAGE_COL_JOINED}</th>
            <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">{STATIC_STRINGS.TASK_MGMT_COL_STATUS}</th>
            <th className="px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider text-right">{STATIC_STRINGS.TASK_MGMT_COL_ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, idx) => (
            <MemberRow 
              key={member.id} 
              member={member} 
              idx={idx} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggleStatus={onToggleStatus} 
              canManage={canManage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
