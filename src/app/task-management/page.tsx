'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { Plus, Search, CheckSquare, AlertCircle, ChevronDown, Pencil, Trash2, CheckCircle2, Timer } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, TaskRole, UserRole } from '@/types';
import { STATIC_STRINGS, ROLES, PAGE_ROLES } from '@/utils/constants';
import { ROLE_CONFIG, STATUS_CONFIG } from '@/utils/ui-configs';
import { teamService } from '@/api/services/team.service';
import { useCreateTask, useGetTasks, useUpdateTask, useDeleteTask } from '@/api/hooks/useTask';
import { useClients } from '@/api/hooks/useClient';
import { useGetTeams } from '@/api/hooks/useTeam';
import { normalizeRole, toApiRole } from '@/utils/roles';


const ROLE_FILTERS: { label: string; value: TaskRole | 'all' }[] = [
  { label: STATIC_STRINGS.TASK_MGMT_ALL_ROLES, value: 'all' },
  { label: ROLES.SHOOTER, value: ROLES.SHOOTER as TaskRole },
  { label: ROLES.EDITOR, value: ROLES.EDITOR as TaskRole },
  { label: ROLES.ADS_MANAGER, value: ROLES.ADS_MANAGER as TaskRole },
];

interface TaskForm {
  title: string;
  assignedTo: string;
  role: TaskRole;
  client: string;
  deadline: string;
  status: TaskStatus;
  description: string;
}

const EMPTY_FORM: TaskForm = {
  title: '',
  assignedTo: '',
  role: ROLES.SHOOTER as TaskRole,
  client: '',
  deadline: '',
  status: 'pending' as TaskStatus,
  description: '',
};


const checkIsOverdue = (deadline: string, status: TaskStatus) => {
  if (!deadline || status === 'completed') return false;
  return new Date(deadline) < new Date();
};

export default function TaskManagementPage() {
  useRoleGuard(PAGE_ROLES.TASK_MANAGEMENT as unknown as UserRole[]);
  
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { mutateAsync: createTaskMutation, isPending: isCreatingTask } = useCreateTask();
  const { mutateAsync: updateTaskMutation } = useUpdateTask();
  const { mutateAsync: deleteTaskMutation } = useDeleteTask();
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const isRestricted = useMemo(() => {
    if (!user?.role) return false;
    const normalizedRole = normalizeRole(user.role);
    return ([ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER] as string[]).includes(normalizedRole as string);
  }, [user?.role]);

  const effectiveRole = useMemo(() => {
    if (isRestricted && user?.role) {
      return toApiRole(normalizeRole(user.role));
    }
    return roleFilter === 'all' ? undefined : toApiRole(roleFilter);
  }, [isRestricted, user?.role, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: apiResponse, isLoading: isTasksLoading, isError, error } = useGetTasks({
    page,
    limit: perPage,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearch.trim() || undefined,
    role: effectiveRole,
  }, { enabled: !isAuthLoading && !!user });

  useEffect(() => {
    if (isError && error) {
    }
  }, [isError, error]);
  
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});

  const [isFetchingRole, setIsFetchingRole] = useState(false);

  const { data: clientsResponse, isLoading: isFetchingClients } = useClients({ page: 1, limit: 100 }, { enabled: !!user && !isRestricted });
  const { data: teamResponse, isLoading: isFetchingTeam } = useGetTeams({ page: 1, limit: 100 }, { enabled: !!user && !isRestricted });

  const clientsList = useMemo((): {id: string, name: string}[] => 
    (clientsResponse as any)?.results?.data?.map((c: any) => ({
      id: c.id,
      name: c.clientName
    })) || [], [clientsResponse]);

  const teamMembers = useMemo((): {id: string, name: string}[] => 
    (teamResponse as any)?.results?.data?.map((m: any) => ({
      id: m.id,
      name: m.fullName || m.name
    })) || [], [teamResponse]);

  const handleMemberChange = async (memberId: string) => {
    const selectedMember = teamMembers.find(m => m.id === memberId);
    if (!selectedMember) return;

    setForm(f => ({ ...f, assignedTo: selectedMember.name }));
    
    setIsFetchingRole(true);
    try {
      const response = await teamService.getMemberRole(memberId);
      if (response?.results?.role) {
        setForm(f => ({ ...f, role: normalizeRole(response.results.role) as TaskRole }));
      }
    } catch (error) {
      console.error('Failed to fetch member role:', error);
    } finally {
      setIsFetchingRole(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isRestricted && user?.role) {
      setRoleFilter(user.role as TaskRole);
    }
  }, [isRestricted, user?.role]);

  const paginatedTasks = useMemo((): Task[] => {
    try {
      const apiData = (apiResponse as any)?.results?.data || [];
      return apiData.map((t: any): Task => ({
        id: t.id,
        title: t.taskTitle || 'Untitled',
        description: t.description || '',
        assignedTo: t.assignee?.fullName || STATIC_STRINGS.COMMON_UNASSIGNED,
        role: normalizeRole(t.assignee?.role || ROLES.SHOOTER) as TaskRole,
        client: t.client?.clientName || 'N/A',
        campaign: t.campaign?.campaignName || 'N/A',
        campaignId: t.campaign?.id,
        deadline: t.deadlineDate ? t.deadlineDate.split('T')[0] : 'N/A',
        status: t.status || 'pending',
      }));
    } catch (err) {
      console.error('Mapping error:', err);
      return [];
    }
  }, [apiResponse]);


  const stats = useMemo(() => {
    const data = (apiResponse as any)?.results?.data || [];
    const pagination = (apiResponse as any)?.results?.pagination;
    return {
      total: pagination?.totalItems || pagination?.totalItem || 0,
      pending: data.filter((t: any) => t.status === 'pending').length,
      inProgress: data.filter((t: any) => t.status === 'in_progress').length,
      completed: data.filter((t: any) => t.status === 'completed').length,
      overdue: data.filter((t: any) => checkIsOverdue(t.deadlineDate, t.status)).length,
    };
  }, [apiResponse]);

  const handleOpenAdd = useCallback(() => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      assignedTo: task.assignedTo === STATIC_STRINGS.COMMON_UNASSIGNED ? '' : task.assignedTo,
      role: task.role,
      client: task.client === 'N/A' ? '' : task.client,
      deadline: task.deadline === 'N/A' ? '' : task.deadline,
      status: task.status as TaskStatus,
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  }, []);

  const handleSave = async () => {
    const newErrors: Partial<Record<keyof TaskForm, string>> = {};
    if (!form.title.trim()) newErrors.title = STATIC_STRINGS.TASK_MGMT_REQUIRED;
    if (!form.assignedTo.trim()) newErrors.assignedTo = STATIC_STRINGS.TASK_MGMT_REQUIRED;
    if (!form.role) newErrors.role = STATIC_STRINGS.TASK_MGMT_REQUIRED;
    if (!form.client.trim()) newErrors.client = STATIC_STRINGS.TASK_MGMT_REQUIRED;
    if (!form.deadline.trim()) newErrors.deadline = STATIC_STRINGS.TASK_MGMT_REQUIRED;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedMember = teamMembers.find(m => m.name === form.assignedTo);
    const assignedToId = selectedMember?.id || '';
    const selectedClient = clientsList.find(c => c.name === form.client);
    const clientId = selectedClient?.id || '';

    try {
      if (editingTask) {
        const apiPayload: any = {};
        if (form.title !== editingTask.title) apiPayload.task_title = form.title;
        if (form.description !== (editingTask.description || '')) apiPayload.description = form.description;
        if (form.assignedTo !== editingTask.assignedTo) apiPayload.assigned_to = assignedToId;
        if (form.client !== editingTask.client) apiPayload.client_id = clientId;
        if (form.deadline !== editingTask.deadline) apiPayload.deadline_date = form.deadline;
        if (form.status !== editingTask.status) apiPayload.status = form.status;
        if (Object.keys(apiPayload).length === 0) {
          setModalOpen(false);
          return;
        }

        await updateTaskMutation({ taskId: editingTask.id, payload: apiPayload });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } else {
        const apiPayload = {
          task_title: form.title,
          description: form.description,
          assigned_to: assignedToId,
          client_id: clientId,
          deadline_date: form.deadline
        };

        await createTaskMutation(apiPayload);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      setModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteModal.task) {
      try {
        await deleteTaskMutation(deleteModal.task.id);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } catch (error: any) {
        console.error('Failed to delete task:', error);
      }
    }
    setDeleteModal({ open: false, task: null });
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskMutation({ taskId, payload: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };


  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 id="task-management-title" className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.TASK_MGMT_TITLE}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{(apiResponse as any)?.results?.pagination?.totalItems || (apiResponse as any)?.results?.pagination?.totalItem || 0} {STATIC_STRINGS.TASK_MGMT_TASKS_SUBTITLE}</p>
          </div>
          {!isRestricted && (
            <button
              id="add-task-button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all shadow-sm"
            >
              <Plus size={16} />
              {STATIC_STRINGS.TASK_MGMT_ADD_TASK}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: STATIC_STRINGS.TASK_MGMT_TOTAL_TASKS, value: stats.total, icon: CheckSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: STATIC_STRINGS.TASK_MGMT_IN_PROGRESS, value: stats.inProgress, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: STATIC_STRINGS.TASK_MGMT_COMPLETED, value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: STATIC_STRINGS.TASK_MGMT_OVERDUE, value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={17} className={stat.color} />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit overflow-x-auto no-scrollbar">
            {ROLE_FILTERS
              .filter(rf => !isRestricted || rf.value === normalizeRole(user?.role || ''))
              .map((rf) => {
                const isActive = roleFilter === rf.value;
                const cfg = rf.value !== 'all' ? ROLE_CONFIG[rf.value] : null;
                const RoleIcon = cfg?.icon;
                return (
                  <button
                    key={rf.value}
                    onClick={() => { setRoleFilter(rf.value); setPage(1); }}
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
                id="status-filter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as TaskStatus | 'all'); setPage(1); }}
                className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">{STATIC_STRINGS.TASK_MGMT_ALL_STATUSES}</option>
                <option value="pending">{STATIC_STRINGS.TASK_MGMT_PENDING}</option>
                <option value="in_progress">{STATIC_STRINGS.TASK_MGMT_IN_PROGRESS}</option>
                <option value="completed">{STATIC_STRINGS.TASK_MGMT_COMPLETED}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="task-search"
                type="text"
                placeholder={STATIC_STRINGS.TASK_MGMT_SEARCH_PLACEHOLDER}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-full sm:w-48 lg:w-64 transition-all hover:border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
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
              {isTasksLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <p className="text-[13px] text-slate-400">Loading tasks...</p>
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <p className="text-[13px] text-slate-400">{STATIC_STRINGS.TASK_MGMT_NO_TASKS}</p>
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task: Task) => {
                  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
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
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
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
                            <button onClick={() => handleOpenEdit(task)} className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteModal({ open: true, task })} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
            totalPages={(apiResponse as any)?.results?.pagination?.totalPages || 1}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            totalEntries={(apiResponse as any)?.results?.pagination?.totalItems || (apiResponse as any)?.results?.pagination?.totalItem || 0}
            labels={{
              show: STATIC_STRINGS.TASK_MGMT_PAGINATION_SHOW,
              of: STATIC_STRINGS.TASK_MGMT_PAGINATION_OF,
              entries: STATIC_STRINGS.TASK_MGMT_PAGINATION_ENTRIES
            }}
          />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? STATIC_STRINGS.TASK_MGMT_EDIT_TASK : STATIC_STRINGS.TASK_MGMT_ADD_NEW_TASK} size="lg">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_LABEL_TITLE} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={STATIC_STRINGS.TASK_MGMT_PLACEHOLDER_TITLE}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.title && <p className="mt-1 text-[11.5px] text-red-500">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_LABEL_DESCRIPTION}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={STATIC_STRINGS.TASK_MGMT_PLACEHOLDER_DESC}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ASSIGNED_TO} <span className="text-red-500">*</span></label>
              <select 
                value={teamMembers.find(m => m.name === form.assignedTo)?.id || ''} 
                onChange={(e) => { handleMemberChange(e.target.value); setErrors(er => ({ ...er, assignedTo: '' })); }} 
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-white ${errors.assignedTo ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`}
              >
                <option value="">{isFetchingTeam ? 'Loading team...' : STATIC_STRINGS.TASK_MGMT_SELECT_TEAMMATE}</option>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {errors.assignedTo && <p className="mt-1 text-[11.5px] text-red-500">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ROLE} <span className="text-red-500">*</span></label>
              <select 
                value={form.role} 
                onChange={(e) => { setForm((f) => ({ ...f, role: e.target.value as TaskRole })); setErrors(er => ({ ...er, role: '' })); }} 
                disabled={true}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-slate-50 text-slate-500 cursor-not-allowed"
              >
                <option value={ROLES.MANAGER}>{ROLES.MANAGER}</option>
                <option value={ROLES.SHOOTER}>{ROLES.SHOOTER}</option>
                <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
                <option value={ROLES.ADS_MANAGER}>{ROLES.ADS_MANAGER}</option>
                <option value={ROLES.SOCIAL_MEDIA_MANAGER}>{ROLES.SOCIAL_MEDIA_MANAGER}</option>
                <option value={ROLES.OWNER}>{ROLES.OWNER}</option>
              </select>
              {errors.role && <p className="mt-1 text-[11.5px] text-red-500">{errors.role}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_CLIENT} <span className="text-red-500">*</span></label>
              <select 
                value={form.client} 
                onChange={(e) => { setForm((f) => ({ ...f, client: e.target.value })); setErrors(er => ({ ...er, client: '' })); }} 
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-white ${errors.client ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`}
              >
                <option value="">{isFetchingClients ? 'Loading clients...' : STATIC_STRINGS.TASK_MGMT_SELECT_CLIENT}</option>
                {clientsList.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              {errors.client && <p className="mt-1 text-[11.5px] text-red-500">{errors.client}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_DEADLINE} <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                value={form.deadline} 
                onChange={(e) => { setForm((f) => ({ ...f, deadline: e.target.value })); setErrors(er => ({ ...er, deadline: '' })); }} 
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`} 
              />
              {errors.deadline && <p className="mt-1 text-[11.5px] text-red-500">{errors.deadline}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.FORM_CANCEL}</button>
            <button 
              onClick={handleSave} 
              disabled={isCreatingTask}
              className="px-5 py-2 rounded-lg bg-violet-600 text-white text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingTask ? 'Creating...' : STATIC_STRINGS.FORM_SAVE_CHANGES}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, task: null })} title={STATIC_STRINGS.TASK_MGMT_CONFIRM_DELETE} size="sm">
        <div className="px-6 py-5">
          <p className="text-[13.5px] text-slate-600 mb-6 leading-relaxed">{STATIC_STRINGS.TASK_MGMT_DELETE_PROMPT} <span className="font-black text-slate-900">"{deleteModal.task?.title}"</span>? </p>
          <div className="flex justify-end gap-2.5">
            <button onClick={() => setDeleteModal({ open: false, task: null })} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.FORM_CANCEL}</button>
            <button onClick={handleDelete} className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-black shadow-md transition-all active:scale-[0.98]">{STATIC_STRINGS.TASK_MGMT_BTN_DELETE}</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
