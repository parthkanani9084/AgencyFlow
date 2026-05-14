'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Plus } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import type { UserRole } from '@/types';
import { STATIC_STRINGS, ROLES, PAGE_ROLES, COMMON_STATUS } from '@/utils/constants';
import {
  useGetTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeamMember,
} from '@/api/hooks/useTeam';
import Pagination from '@/components/ui/Pagination';
import { TeamStats } from './components/TeamStats';
import { TeamFilters } from './components/TeamFilters';
import { TeamTable } from './components/TeamTable';
import { TeamMemberModal, DeleteConfirmModal } from './components/TeamModals';

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

const ALL_ROLES: UserRole[] = [
  ROLES.MANAGER,
  ROLES.SHOOTER,
  ROLES.EDITOR,
  ROLES.ADS_MANAGER,
  ROLES.SOCIAL_MEDIA_MANAGER,
] as UserRole[];

const emptyForm = { name: '', email: '', role: '' as unknown as UserRole };

export default function TeamPage() {
  useRoleGuard(PAGE_ROLES.TEAM as unknown as UserRole[]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof COMMON_STATUS.ALL>(COMMON_STATUS.ALL);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: TeamMember | null }>({
    open: false,
    member: null,
  });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: apiResponse, isLoading } = useGetTeams({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    role: roleFilter !== COMMON_STATUS.ALL ? roleFilter : undefined,
  });

  const { mutateAsync: createTeamAsync, isPending: isCreating } = useCreateTeam();
  const { mutateAsync: updateTeamAsync, isPending: isUpdating } = useUpdateTeam();
  const { mutateAsync: deleteTeamAsync, isPending: isDeleting } = useDeleteTeamMember();

  const isAnyMutationPending = isCreating || isUpdating || isDeleting;
  useEffect(() => {
    const data = apiResponse?.results?.data || [];

    const mapped = data
      .filter((m: any) => m.role !== ROLES.OWNER)
      .map((m: any) => ({
        id: m.id,
        name: m.fullName,
        email: m.email,
        role: m.role as UserRole,
        status: (m.status || COMMON_STATUS.ACTIVE) as typeof COMMON_STATUS.ACTIVE | typeof COMMON_STATUS.INACTIVE,
        joinedAt: m.createdAt?.split('T')[0] || 'N/A',
        tasksCompleted: 0,
        tasksActive: 0,
      }));

    setMembers(mapped);
  }, [apiResponse]);

  const filtered = members;

  const stats = useMemo(() => {
    const summary = apiResponse?.results?.summary;


    return {
      total: summary?.total_count || 0,
      active: members.filter((m) => m.status === COMMON_STATUS.ACTIVE).length,
      byRole: ALL_ROLES.map((r) => {
        let count = 0;
        if (r === ROLES.MANAGER) count = summary?.manager_count || 0;
        else if (r === ROLES.SHOOTER) count = summary?.shooter_count || 0;
        else if (r === ROLES.EDITOR) count = summary?.editor_count || 0;
        else if (r === ROLES.ADS_MANAGER) count = summary?.ads_manager_count || 0;
        else if (r === ROLES.SOCIAL_MEDIA_MANAGER) count = summary?.social_media_manager_count || 0;
        
        return { role: r, count };
      }),
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
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = STATIC_STRINGS.FORM_EMAIL_REQUIRED;
    if (!form.role) e.role = STATIC_STRINGS.TASK_MGMT_ERR_ROLE as any;

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    try {
      if (editingMember) {
        const payload: any = {};
        if (form.name.trim() !== editingMember.name) payload.full_name = form.name.trim();
        if (form.role !== editingMember.role) payload.role = form.role;

        if (Object.keys(payload).length > 0) {
          await updateTeamAsync({ teamId: editingMember.id, payload });
        }
      } else {
        await createTeamAsync({
          full_name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        });
      }
      setModalOpen(false);
    } catch (error) {}
  };

  const handleDelete = useCallback(async () => {
    if (deleteModal.member) {
      try {
        await deleteTeamAsync(deleteModal.member.id);
      } catch (error) {}
    }
    setDeleteModal({ open: false, member: null });
  }, [deleteModal.member, deleteTeamAsync]);

  const toggleStatus = useCallback((id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === COMMON_STATUS.ACTIVE ? COMMON_STATUS.INACTIVE : COMMON_STATUS.ACTIVE } : m
      )
    );
  }, []);

  return (
    <AppLayout>
      {/* Interaction Blocker */}
      {isAnyMutationPending && (
        <div className="fixed inset-0 z-[9999] cursor-wait" aria-hidden="true" />
      )}

      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-violet-600" />
              {STATIC_STRINGS.TEAM_PAGE_TITLE}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
              {stats.active} {STATIC_STRINGS.TEAM_PAGE_SUBTITLE_PART1} · {stats.total}{' '}
              {STATIC_STRINGS.TEAM_PAGE_SUBTITLE_PART2}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-violet-100 active:scale-[0.98]"
          >
            <Plus size={15} />
            {STATIC_STRINGS.TEAM_PAGE_INVITE_MEMBER}
          </button>
        </div>

        <TeamStats stats={stats} />

        <TeamFilters
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          allRoles={ALL_ROLES}
        />

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <TeamTable
            members={filtered}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={(member) => setDeleteModal({ open: true, member })}
            onToggleStatus={toggleStatus}
          />

          {!isLoading && apiResponse?.results?.pagination && (
            <Pagination
              currentPage={page}
              totalPages={apiResponse.results.pagination.totalPages || 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={setPerPage}
              totalEntries={apiResponse.results.pagination.totalItems || 0}
            />
          )}
        </div>
      </div>

      <TeamMemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingMember={editingMember}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        onSave={handleSave}
        isProcessing={isCreating || isUpdating}
        allRoles={ALL_ROLES}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, member: null })}
        member={deleteModal.member}
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </AppLayout>
  );
}
