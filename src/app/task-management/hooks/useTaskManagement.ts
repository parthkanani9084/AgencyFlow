import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, TaskRole } from '@/types';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { teamService } from '@/api/services/team.service';
import { 
  useCreateTask, 
  useGetTasks, 
  useUpdateTask, 
  useDeleteTask, 
  useUpdateTaskStatus, 
  useAssignTask, 
  useCompleteTask 
} from '@/api/hooks/useTask';
import { useClients } from '@/api/hooks/useClient';
import { useGetTeams } from '@/api/hooks/useTeam';
import { normalizeRole, toApiRole } from '@/utils/roles';
import { useAuth } from '@/context/AuthContext';
import { QUERY_KEYS } from '@/api/queryKeys';
import { EMPTY_TASK_FORM, TASK_CONSTANTS, TASK_STATUSES, TASK_FALLBACKS } from '@/utils/constants';
import { TaskForm, TaskStats as ITaskStats } from '../types';

interface MemberItem {
  id: string;
  name: string;
  role: string;
}

interface ClientItem {
  id: string;
  name: string;
}

export const useTaskManagement = () => {
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { mutateAsync: createTaskMutation, isPending: isCreatingTask } = useCreateTask();
  const { mutateAsync: updateTaskMutation } = useUpdateTask();
  const { mutateAsync: deleteTaskMutation } = useDeleteTask();
  const { mutateAsync: updateTaskStatusMutation } = useUpdateTaskStatus();
  const { mutateAsync: assignTaskMutation } = useAssignTask();
  const { mutateAsync: completeTaskMutation } = useCompleteTask();
  
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(TASK_CONSTANTS.DEFAULT_PER_PAGE);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | typeof TASK_STATUSES.ALL>(TASK_STATUSES.ALL);
  const [roleFilter, setRoleFilter] = useState<TaskRole | typeof TASK_STATUSES.ALL>(TASK_STATUSES.ALL);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<Task | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [form, setForm] = useState<TaskForm>(EMPTY_TASK_FORM as unknown as TaskForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});

  const isRestricted = useMemo(() => {
    if (!user?.role) return false;
    const normalizedRole = normalizeRole(user.role);
    return ([ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER] as string[]).includes(normalizedRole as string);
  }, [user?.role]);

  const effectiveRole = useMemo(() => {
    if (isRestricted && user?.role) {
      return toApiRole(normalizeRole(user.role));
    }
    return roleFilter === TASK_STATUSES.ALL ? undefined : toApiRole(roleFilter);
  }, [isRestricted, user?.role, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, TASK_CONSTANTS.DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: apiResponse, isLoading: isTasksLoading } = useGetTasks({
    page,
    limit: perPage,
    status: statusFilter === TASK_STATUSES.ALL ? undefined : statusFilter,
    search: debouncedSearch.trim() || undefined,
    role: effectiveRole,
  }, { enabled: !isAuthLoading && !!user });

  const { data: clientsResponse, isLoading: isFetchingClients } = useClients(
    { page: 1, limit: 100 }, 
    { enabled: !!user }
  );
  
  const { data: teamResponse, isLoading: isFetchingTeam } = useGetTeams(
    { page: 1, limit: 100 }, 
    { enabled: !!user }
  );

  const clientsList = useMemo((): ClientItem[] => 
    (clientsResponse as any)?.results?.data?.map((c: any) => ({
      id: c.id,
      name: c.clientName
    })) || [], [clientsResponse]);

  const teamMembers = useMemo((): MemberItem[] =>
    (teamResponse as any)?.results?.data?.map((m: any) => ({
      id: m.id,
      name: m.fullName || m.name,
      role: m.role,
    })) || [], [teamResponse]);

  useEffect(() => {
    if (isRestricted && user?.role) {
      setRoleFilter(user.role as TaskRole);
    }
  }, [isRestricted, user?.role]);

  const checkIsOverdue = useCallback((deadline: string, status: TaskStatus) => {
    if (!deadline || deadline === TASK_FALLBACKS.NOT_AVAILABLE || status === TASK_STATUSES.COMPLETED) return false;
    return new Date(deadline) < new Date();
  }, []);

  const paginatedTasks = useMemo((): Task[] => {
    try {
      const apiData = (apiResponse as any)?.results?.data || [];
      return apiData.map(
        (t: any): Task => ({
          id: t.task_id || t.id,
          title: t.task_title || t.taskTitle || TASK_FALLBACKS.UNTITLED,
          description: t.description || '',
          assignedTo: t.current_assignee?.full_name || TASK_FALLBACKS.NOT_AVAILABLE,
          role: t.current_assignee?.role || ROLES.MANAGER,
          client: t.client?.client_name || t.clientName || TASK_FALLBACKS.NOT_AVAILABLE,
          campaign: t.campaign?.campaignName || t.campaign_name || TASK_FALLBACKS.NOT_AVAILABLE,
          campaignId: t.campaign?.id,
          deadline:
            (t.deadline_date || '').split('T')[0] || TASK_FALLBACKS.NOT_AVAILABLE,
          status: t.status || TASK_STATUSES.PENDING,
        })
      );
    } catch (err) {
      console.error('Mapping error:', err);
      return [];
    }
  }, [apiResponse]);

  const stats = useMemo((): ITaskStats => {
    const data = (apiResponse as any)?.results?.data || [];
    const pagination = (apiResponse as any)?.results?.pagination;
    return {
      total: pagination?.totalItems || pagination?.totalItem || 0,
      pending: data.filter((t: any) => t.status === TASK_STATUSES.PENDING).length,
      inProgress: data.filter((t: any) => t.status === TASK_STATUSES.IN_PROGRESS).length,
      completed: data.filter((t: any) => t.status === TASK_STATUSES.COMPLETED).length,
      overdue: data.filter((t: any) => checkIsOverdue(t.deadlineDate || t.deadline_date, t.status)).length,
    };
  }, [apiResponse, checkIsOverdue]);

  const handleOpenAdd = useCallback(() => {
    setEditingTask(null);
    setForm(EMPTY_TASK_FORM as unknown as TaskForm);
    setErrors({});
    setModalOpen(true);
  }, [setEditingTask, setForm, setErrors, setModalOpen]);

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      assignedTo: task.assignedTo === STATIC_STRINGS.COMMON_UNASSIGNED ? '' : task.assignedTo,
      role: task.role as TaskRole,
      client: task.client === TASK_FALLBACKS.NOT_AVAILABLE ? '' : task.client,
      deadline: task.deadline === TASK_FALLBACKS.NOT_AVAILABLE ? '' : task.deadline,
      status: task.status as TaskStatus,
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  }, [setEditingTask, setForm, setErrors, setModalOpen]);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, [setPerPage, setPage]);

  const handleSave = async () => {
    const newErrors: Partial<Record<keyof TaskForm, string>> = {};
    if (!form.title.trim()) newErrors.title = STATIC_STRINGS.TASK_MGMT_ERR_TITLE;
    if (!form.assignedTo.trim()) newErrors.assignedTo = STATIC_STRINGS.TASK_MGMT_ERR_ASSIGNED_TO;
    if (!form.role) newErrors.role = STATIC_STRINGS.TASK_MGMT_ERR_ROLE;
    if (!form.client.trim()) newErrors.client = STATIC_STRINGS.TASK_MGMT_ERR_CLIENT;
    if (!form.deadline.trim()) newErrors.deadline = STATIC_STRINGS.TASK_MGMT_ERR_DEADLINE;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const member = teamMembers.find(m => m.name === form.assignedTo);
    const assignedToId = member?.id || '';
    const client = clientsList.find(c => c.name === form.client);
    const clientId = client?.id || '';

    try {
      if (editingTask) {
        const apiPayload: any = {};
        if (form.title !== editingTask.title) apiPayload.task_title = form.title;
        if (form.description !== (editingTask.description || '')) apiPayload.description = form.description;
        if (form.assignedTo !== editingTask.assignedTo) apiPayload.assigned_to = assignedToId;
        if (form.client !== editingTask.client) apiPayload.client_id = clientId;
        if (form.deadline !== editingTask.deadline) apiPayload.deadline_date = form.deadline;
        if (form.status !== editingTask.status) apiPayload.status = form.status;
        
        if (Object.keys(apiPayload).length > 0) {
          await updateTaskMutation({ taskId: editingTask.id, payload: apiPayload });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
        }
      } else {
        const apiPayload = {
          task_title: form.title,
          description: form.description,
          assigned_to: assignedToId,
          client_id: clientId,
          deadline_date: form.deadline
        };

        await createTaskMutation(apiPayload);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleMemberChange = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    setForm(f => ({ ...f, assignedTo: member.name }));
    
    try {
      const response = await teamService.getMemberRole(memberId);
      if (response?.results?.role) {
        setForm(f => ({ ...f, role: normalizeRole(response.results.role) as TaskRole }));
      }
    } catch (error) {
      console.error('Failed to fetch member role:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteModal.task) {
      try {
        await deleteTaskMutation(deleteModal.task.id);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setDeleteModal({ open: false, task: null });
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === TASK_STATUSES.COMPLETED) {
      const task = paginatedTasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTaskForCompletion(task);
        setCompletionModalOpen(true);
      }
    } else {
      try {
        await updateTaskStatusMutation({ taskId, status: newStatus });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const onCompleteTask = async (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string | File) => {
    try {
      let assignedToId: string | undefined;
      if (nextMember) {
        const member = teamMembers.find(m => m.name === nextMember.name);
        if (member) assignedToId = member.id;
      }
      
      if (assignedToId) {
        await assignTaskMutation({ 
          taskId, 
          assignedTo: assignedToId,
          notes 
        });
      } else {
        await completeTaskMutation({ 
          taskId, 
          notes, 
          screenshot 
        });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      setCompletionModalOpen(false);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const totalEntries = (apiResponse as any)?.results?.pagination?.totalItems || (apiResponse as any)?.results?.pagination?.totalItem || 0;
  const totalPages = (apiResponse as any)?.results?.pagination?.totalPages || 1;

  return {
    user,
    page,
    setPage,
    perPage,
    handlePerPageChange,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    search,
    setSearch,
    isTasksLoading,
    paginatedTasks,
    stats,
    modalOpen,
    setModalOpen,
    completionModalOpen,
    setCompletionModalOpen,
    editingTask,
    selectedTaskForCompletion,
    deleteModal,
    setDeleteModal,
    form,
    setForm,
    errors,
    setErrors,
    isRestricted,
    isCreatingTask,
    clientsList,
    teamMembers,
    isFetchingTeam,
    isFetchingClients,
    totalEntries,
    totalPages,
    handleOpenAdd,
    handleOpenEdit,
    handleSave,
    handleDelete,
    handleStatusChange,
    handleMemberChange,
    onCompleteTask,
    checkIsOverdue,
  };
};
