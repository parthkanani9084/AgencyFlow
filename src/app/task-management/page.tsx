'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Plus, Search, CheckSquare, AlertCircle, ChevronDown, User, Pencil, Trash2, CheckCircle2, Circle, Timer, Camera, Film, Megaphone, TrendingUp } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, TaskPriority, TaskRole, UserRole } from '@/types';
import { STATIC_STRINGS, ROLES, PAGE_ROLES, TEAM_MEMBERS as CONST_TEAM_MEMBERS, CLIENT_OPTIONS } from '@/utils/constants';

const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  [ROLES.SHOOTER]: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  [ROLES.EDITOR]: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  [ROLES.ADS_MANAGER]: { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
  [ROLES.SOCIAL_MEDIA_MANAGER]: { color: 'text-pink-700', bg: 'bg-pink-100', icon: TrendingUp },
  [ROLES.OWNER]: { color: 'text-violet-700', bg: 'bg-violet-100', icon: User },
  [ROLES.MANAGER]: { color: 'text-teal-700', bg: 'bg-teal-100', icon: User },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: STATIC_STRINGS.TASK_MGMT_PENDING, color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: STATIC_STRINGS.TASK_MGMT_IN_PROGRESS, color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: STATIC_STRINGS.TASK_MGMT_COMPLETED, color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

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
  campaign: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
}

const EMPTY_FORM: TaskForm = {
  title: '',
  assignedTo: '',
  role: ROLES.SHOOTER as TaskRole,
  client: '',
  campaign: STATIC_STRINGS.TASK_MGMT_DEFAULT_CAMPAIGN,
  deadline: '',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  description: '',
};

const TEAM_MEMBERS = CONST_TEAM_MEMBERS;

const checkIsOverdue = (deadline: string, status: TaskStatus) => {
  if (!deadline || status === 'completed') return false;
  return new Date(deadline) < new Date();
};

export default function TaskManagementPage() {
  useRoleGuard(PAGE_ROLES.TASK_MANAGEMENT as unknown as UserRole[]);
  
  const { user } = useAuth();
  const { tasks: rawTasks, addTask, updateTask, deleteTask } = useTasks();
  
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});

  const isRestricted = useMemo(() => 
    user?.role && [ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER].includes(user.role as any)
  , [user?.role]);

  useEffect(() => {
    setMounted(true);
    if (isRestricted && user?.role) {
      setRoleFilter(user.role as TaskRole);
    }
  }, [isRestricted, user?.role]);

  const tasks = useMemo(() => {
    if (!user) return [];
    if (user.role === ROLES.OWNER || user.role === ROLES.MANAGER || user.role === ROLES.SOCIAL_MEDIA_MANAGER) return rawTasks;
    return rawTasks.filter(t => t.assignedTo === user.name || t.role === user.role);
  }, [rawTasks, user]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q) ||
        (t.client || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || t.role === roleFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [tasks, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => checkIsOverdue(t.deadline, t.status as TaskStatus)).length,
  }), [tasks]);

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
      assignedTo: task.assignedTo,
      role: task.role,
      client: task.client,
      campaign: task.campaign || STATIC_STRINGS.TASK_MGMT_DEFAULT_CAMPAIGN,
      deadline: task.deadline,
      status: task.status as TaskStatus,
      priority: task.priority,
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  }, []);

  const handleSave = () => {
    if (!form.title.trim()) { setErrors({ title: STATIC_STRINGS.TASK_MGMT_REQUIRED }); return; }
    if (!form.assignedTo.trim()) { setErrors({ assignedTo: STATIC_STRINGS.TASK_MGMT_REQUIRED }); return; }

    const payload = {
      ...form,
      campaignId: editingTask?.campaignId || `c_${form.client.toLowerCase().replace(/\s+/g, '_')}`,
      campaign: editingTask?.campaign || form.campaign || STATIC_STRINGS.TASK_MGMT_DEFAULT_DELIVERY,
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal.task) {
      deleteTask(deleteModal.task.id);
    }
    setDeleteModal({ open: false, task: null });
  };

  const handleCycleStatus = (task: Task) => {
    if (task.status === 'completed') return;
    const next: TaskStatus = task.status === 'pending' ? 'in_progress' : 'pending';
    updateTask(task.id, { status: next });
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.TASK_MGMT_TITLE}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{tasks.length} {STATIC_STRINGS.TASK_MGMT_TASKS_SUBTITLE}</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            {STATIC_STRINGS.TASK_MGMT_ADD_TASK}
          </button>
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

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {ROLE_FILTERS
            .filter(rf => !isRestricted || rf.value === 'all' || rf.value === user?.role)
            .map((rf) => {
              const isActive = roleFilter === rf.value;
              const cfg = rf.value !== 'all' ? ROLE_CONFIG[rf.value] : null;
              const RoleIcon = cfg?.icon;
              return (
                <button
                  key={rf.value}
                  onClick={() => setRoleFilter(rf.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all border ${
                    isActive ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {RoleIcon && <RoleIcon size={13} />}
                  {rf.label}
                </button>
              );
            })}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
              >
                <option value="all">{STATIC_STRINGS.TASK_MGMT_ALL_STATUSES}</option>
                <option value="pending">{STATIC_STRINGS.TASK_MGMT_PENDING}</option>
                <option value="in_progress">{STATIC_STRINGS.TASK_MGMT_IN_PROGRESS}</option>
                <option value="completed">{STATIC_STRINGS.TASK_MGMT_COMPLETED}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={STATIC_STRINGS.TASK_MGMT_SEARCH_PLACEHOLDER}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-48"
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
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.TASK_MGMT_COL_ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <p className="text-[13px] text-slate-400">{STATIC_STRINGS.TASK_MGMT_NO_TASKS}</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
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
                        <button
                          onClick={() => handleCycleStatus(task)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          <StatusIcon size={11} />
                          {statusCfg.label}
                        </button>
                      </td>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
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
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ASSIGNED_TO}</label>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition bg-white">
                <option value="">{STATIC_STRINGS.TASK_MGMT_SELECT_TEAMMATE}</option>
                {TEAM_MEMBERS.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as TaskRole }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition bg-white">
                <option value={ROLES.MANAGER}>{ROLES.MANAGER}</option>
                <option value={ROLES.SHOOTER}>{ROLES.SHOOTER}</option>
                <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
                <option value={ROLES.ADS_MANAGER}>{ROLES.ADS_MANAGER}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_CLIENT}</label>
              <select value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition bg-white">
                <option value="">{STATIC_STRINGS.TASK_MGMT_SELECT_CLIENT}</option>
                {CLIENT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_DEADLINE}</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition" />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.FORM_CANCEL}</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-violet-600 text-white text-[13px] font-semibold">{STATIC_STRINGS.FORM_SAVE_CHANGES}</button>
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
