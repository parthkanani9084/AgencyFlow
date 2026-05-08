'use client';

import React, { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Users, Plus, Pencil, Trash2, Search, X, Mail, Camera, Film, Megaphone, UserCheck, Crown, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import type { UserRole } from '@/types';
import { STATIC_STRINGS, ROLES, PAGE_ROLES } from '@/utils/constants';
import { useGetTeams, useCreateTeam, useUpdateTeam, useDeleteTeamMember } from '@/api/hooks/useTeam';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/utils/roles';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  joinedAt: string;
  tasksCompleted: number;
  tasksActive: number;
}

const roleConfig: Record<UserRole, { color: string; bg: string; icon: React.ElementType }> = {
  [ROLES.SUPER_ADMIN]: { color: 'text-violet-700', bg: 'bg-violet-100', icon: Crown },
  [ROLES.OWNER]:        { color: 'text-violet-700', bg: 'bg-violet-100', icon: Crown },
  [ROLES.MANAGER]:      { color: 'text-teal-700',   bg: 'bg-teal-100',   icon: UserCheck },
  [ROLES.SHOOTER]:      { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Camera },
  [ROLES.EDITOR]:       { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  [ROLES.ADS_MANAGER]:{ color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
  [ROLES.SOCIAL_MEDIA_MANAGER]: { color: 'text-pink-700', bg: 'bg-pink-100', icon: TrendingUp },
  [ROLES.CLIENT]:       { color: 'text-indigo-700', bg: 'bg-indigo-100', icon: UserCheck },
};

const avatarColors: Record<UserRole, string> = {
  [ROLES.SUPER_ADMIN]: 'bg-violet-600',
  [ROLES.OWNER]:        'bg-violet-600',
  [ROLES.MANAGER]:      'bg-teal-600',
  [ROLES.SHOOTER]:      'bg-blue-600',
  [ROLES.EDITOR]:       'bg-purple-600',
  [ROLES.ADS_MANAGER]:'bg-orange-600',
  [ROLES.SOCIAL_MEDIA_MANAGER]: 'bg-pink-600',
  [ROLES.CLIENT]:      'bg-indigo-600',
};

const ALL_ROLES: UserRole[] = [ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] as UserRole[];


const emptyForm = { name: '', email: '', role: ROLES.SHOOTER as UserRole };

export default function TeamPage() {
  useRoleGuard(PAGE_ROLES.TEAM as unknown as UserRole[]);
  const { user } = useAuth();

  const isRestricted = useMemo(() => 
    user?.role && [ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER].includes(user.role as any)
  , [user?.role]);


  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: apiResponse, isLoading } = useGetTeams({
    page,
    limit: perPage,
    search: debouncedSearch || undefined
  });

  const { mutateAsync: createTeamAsync, isPending: isCreating } = useCreateTeam();
  const { mutateAsync: updateTeamAsync, isPending: isUpdating } = useUpdateTeam();
  const { mutateAsync: deleteTeamAsync } = useDeleteTeamMember();

  React.useEffect(() => {
    const data = (apiResponse as any)?.results?.data;
    if (data) {
      const mapped = data.map((m: any) => ({
        id: m.id,
        name: m.fullName || m.full_name,
        email: m.email,
        role: normalizeRole(m.role),
        status: m.status as 'active' | 'inactive',
        joinedAt: m.createdAt?.split('T')[0] || 'N/A',
        tasksCompleted: 0,
        tasksActive: 0,
      }));
      setMembers(mapped);
    }
  }, [apiResponse]);

  const filtered = useMemo(() => {

    if (roleFilter === 'all') return members;
    return members.filter(m => m.role === roleFilter);
  }, [members, roleFilter]);

  const stats = useMemo(() => {
    const pagination = (apiResponse as any)?.results?.pagination;
    return {
      total: pagination?.totalItems || pagination?.totalItem || 0,
      active: members.filter((m) => m.status === 'active').length, // This is only for current page
      byRole: ALL_ROLES.map((r) => ({ role: r, count: members.filter((m) => m.role === r).length })),
    };
  }, [apiResponse, members]);

  const openAdd = useCallback(() => {
    setEditingMember(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setForm({ name: member.name, email: member.email, role: member.role });
    setErrors({});
    setModalOpen(true);
  }, []);

  const handleSave = async () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = STATIC_STRINGS.FORM_NAME_REQUIRED;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = STATIC_STRINGS.FORM_EMAIL_REQUIRED;

    if (Object.keys(e).length > 0) { 
      setErrors(e); 
      return; 
    }

    if (editingMember) {
      const payload: any = {};
      if (form.name.trim() !== editingMember.name) payload.full_name = form.name.trim();
      if (form.role !== editingMember.role) payload.role = form.role;

      if (Object.keys(payload).length === 0) {
        setModalOpen(false);
        return;
      }

      try {
        await updateTeamAsync({
          teamId: editingMember.id,
          payload,
        });
        setModalOpen(false);
      } catch (error: any) {
      }
    } else {
      try {
        await createTeamAsync({
          full_name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
        setModalOpen(false);
      } catch (error: any) {
      }
    }
  };

  const handleDelete = useCallback(async () => {
    if (deleteModal.member) {
      try {
        await deleteTeamAsync(deleteModal.member.id);
      } catch (error: any) {
      }
    }
    setDeleteModal({ open: false, member: null });
  }, [deleteModal.member, deleteTeamAsync]);

  const toggleStatus = useCallback((id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    );
  }, []);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-violet-600" />
              {STATIC_STRINGS.TEAM_PAGE_TITLE}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {stats.active} {STATIC_STRINGS.TEAM_PAGE_SUBTITLE_PART1} · {stats.total} {STATIC_STRINGS.TEAM_PAGE_SUBTITLE_PART2}
            </p>
          </div>
          {!isRestricted && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={15} />
              {STATIC_STRINGS.TEAM_PAGE_INVITE_MEMBER}
            </button>
          )}
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {stats.byRole.map(({ role, count }) => {
            const cfg = roleConfig[role];
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

        {/* Filters */}
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
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${roleFilter === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {STATIC_STRINGS.NOTIFICATIONS_ALL}
            </button>
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${roleFilter === r ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-[13px] text-slate-400">Fetching team members...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-medium">{STATIC_STRINGS.CLIENT_MGMT_NO_CLIENTS}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">{STATIC_STRINGS.TEAM_PAGE_COL_MEMBER}</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden md:table-cell">{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden lg:table-cell">{STATIC_STRINGS.DASHBOARD_ALL_TASKS}</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">{STATIC_STRINGS.TEAM_PAGE_COL_JOINED}</th>
                    <th className="px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">{STATIC_STRINGS.TASK_MGMT_COL_STATUS}</th>
                    {!isRestricted && <th className="px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider text-right">{STATIC_STRINGS.TASK_MGMT_COL_ACTIONS}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, idx) => {
                    const cfg = roleConfig[member.role] || roleConfig[ROLES.SHOOTER];
                    const RoleIcon = cfg.icon;
                    const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr
                        key={member.id}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${avatarColors[member.role]} flex items-center justify-center flex-shrink-0`}>
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
                        <td className="px-5 py-3.5 hidden lg:table-cell">
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
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{member.joinedAt}</td>
                        <td className="px-5 py-3.5">
                          {isRestricted ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {member.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {member.status === 'active' ? STATIC_STRINGS.TEAM_PAGE_STATUS_ACTIVE : STATIC_STRINGS.TEAM_PAGE_STATUS_INACTIVE}
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleStatus(member.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                member.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {member.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                              {member.status === 'active' ? STATIC_STRINGS.TEAM_PAGE_STATUS_ACTIVE : STATIC_STRINGS.TEAM_PAGE_STATUS_INACTIVE}
                            </button>
                          )}
                        </td>
                        {!isRestricted && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(member)}
                                className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                                title={STATIC_STRINGS.TEAM_PAGE_EDIT_MEMBER_TOOLTIP}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteModal({ open: true, member })}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                title={STATIC_STRINGS.TEAM_PAGE_REMOVE_MEMBER_TOOLTIP}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoading && (apiResponse as any)?.results?.pagination && (
            <Pagination
              currentPage={page}
              totalPages={(apiResponse as any).results.pagination.totalPages || 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={setPerPage}
              totalEntries={(apiResponse as any).results.pagination.totalItems || (apiResponse as any).results.pagination.totalItem || 0}
            />
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? STATIC_STRINGS.TEAM_PAGE_MODAL_EDIT_TITLE : STATIC_STRINGS.TEAM_PAGE_MODAL_INVITE_TITLE}
        subtitle={editingMember ? STATIC_STRINGS.TEAM_PAGE_MODAL_EDIT_SUBTITLE : STATIC_STRINGS.TEAM_PAGE_MODAL_INVITE_SUBTITLE}
        size="md"
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
            {STATIC_STRINGS.TEAM_PAGE_LABEL_FULL_NAME} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: '' })); }}
              placeholder="e.g. Marco Reyes"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
            {STATIC_STRINGS.TEAM_PAGE_LABEL_EMAIL} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: '' })); }}
              placeholder="e.g. marco@agencyflow.io"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((r) => {
                const cfg = roleConfig[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12.5px] font-medium transition-all ${
                      form.role === r
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} />
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {STATIC_STRINGS.FORM_CANCEL}
            </button>
            <button
              onClick={handleSave}
              disabled={isCreating || isUpdating}
              className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? 'Sending...' : (editingMember ? STATIC_STRINGS.FORM_SAVE_CHANGES : STATIC_STRINGS.TEAM_PAGE_BTN_SEND_INVITE)}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, member: null })}
        title={STATIC_STRINGS.TEAM_PAGE_CONFIRM_REMOVE_TITLE}
        subtitle={STATIC_STRINGS.TEAM_PAGE_CONFIRM_REMOVE_SUBTITLE}
        size="sm"
      >
        <div className="px-6 py-5">
          {deleteModal.member && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg mb-5">
              <div className={`w-8 h-8 rounded-full ${avatarColors[deleteModal.member.role]} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[11px] font-bold text-white">
                  {deleteModal.member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{deleteModal.member.name}</p>
                <p className="text-[11px] text-slate-500">{deleteModal.member.role}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteModal({ open: false, member: null })}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {STATIC_STRINGS.FORM_CANCEL}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors"
            >
              {STATIC_STRINGS.TEAM_PAGE_BTN_REMOVE}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
