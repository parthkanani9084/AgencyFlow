'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Plus, Search, X, CheckSquare, AlertCircle, ChevronDown, User, Pencil, Trash2, CheckCircle2, Circle, Timer, Camera, Film, Megaphone } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, TaskPriority, TaskRole } from '@/types';

/**
 * UI Configuration
 */
const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Shooter: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  Editor: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  'Ads Manager': { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
  Owner: { color: 'text-violet-700', bg: 'bg-violet-100', icon: User },
  Manager: { color: 'text-teal-700', bg: 'bg-teal-100', icon: User },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'text-slate-500', dot: 'bg-slate-400' },
  medium: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  high: { label: 'High', color: 'text-red-600', dot: 'bg-red-500' },
};

const ROLE_FILTERS: { label: string; value: TaskRole | 'all' }[] = [
  { label: 'All Roles', value: 'all' },
  { label: 'Shooter', value: 'Shooter' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Ads Manager', value: 'Ads Manager' },
];

const EMPTY_FORM = {
  title: '',
  assignedTo: '',
  role: 'Shooter' as TaskRole,
  client: '',
  campaign: 'General',
  deadline: '',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  description: '',
};

const TEAM_MEMBERS = [
  { id: 'tm1', name: 'Marco Reyes', role: 'Shooter' },
  { id: 'tm2', name: 'Jin Park', role: 'Editor' },
  { id: 'tm3', name: 'Sofia Nguyen', role: 'Ads Manager' },
  { id: 'tm4', name: 'Amara Diallo', role: 'Editor' },
  { id: 'tm5', name: 'Priya Sharma', role: 'Manager' },
  { id: 'tm6', name: 'Alex Rivera', role: 'Owner' },
];

const CLIENT_OPTIONS = [
  'Luxe Apparel', 'TechWorld', 'Velocity Motors', 'GreenRoot', 'Nexus Capital', 'Orion Fitness',
];

/**
 * Helpers
 */
const checkIsOverdue = (deadline: string, status: TaskStatus) => {
  if (!deadline || status === 'completed') return false;
  return new Date(deadline) < new Date();
};

/**
 * Task Management Module
 * Strictly refactored to maintain UI parity while improving type safety and stability.
 */
export default function TaskManagementPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  
  const { user } = useAuth();
  const { tasks: rawTasks, addTask, updateTask, deleteTask } = useTasks();
  
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  // 1. RBAC & Visibility Logic (Localized for stability)
  const isRestricted = useMemo(() => 
    user?.role && ['Shooter', 'Editor', 'Ads Manager', 'Social Media Manager'].includes(user.role)
  , [user?.role]);

  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');

  useEffect(() => {
    setMounted(true);
    if (isRestricted && user?.role) {
      setRoleFilter(user.role as TaskRole);
    }
  }, [isRestricted, user?.role]);

  const tasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Owner' || user.role === 'Manager') return rawTasks;
    return rawTasks.filter(t => t.assignedTo === user.name || t.role === user.role);
  }, [rawTasks, user]);

  // 2. Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        (t.client || '').toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || t.role === roleFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [tasks, search, roleFilter, statusFilter]);

  // 3. Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => checkIsOverdue(t.deadline, t.status as TaskStatus)).length,
  }), [tasks]);

  // 4. Handlers
  const handleOpenAdd = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      assignedTo: task.assignedTo,
      role: task.role,
      client: task.client,
      campaign: task.campaign || 'General',
      deadline: task.deadline,
      status: task.status as TaskStatus,
      priority: task.priority,
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { setErrors({ title: 'Required' }); return; }
    if (!form.assignedTo.trim()) { setErrors({ assignedTo: 'Required' }); return; }

    const payload = {
      ...form,
      campaignId: editingTask?.campaignId || `c_${form.client.toLowerCase().replace(/\s+/g, '_')}`,
      campaign: editingTask?.campaign || form.campaign || 'General Delivery',
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Task Management</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{tasks.length} tasks across all roles</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
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

        {/* Search & Filter Bar */}
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
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-48"
              />
            </div>
          </div>
        </div>

        {/* Task Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Task</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assigned To</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Deadline</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <p className="text-[13px] text-slate-400">No tasks found</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  const roleCfg = ROLE_CONFIG[task.role] || ROLE_CONFIG.Shooter;
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
                        <span className="text-[12.5px] text-slate-700">{task.assignedTo || 'Unassigned'}</span>
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

      {/* Upsert Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add New Task'} size="lg">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Assigned To</label>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px]">
                <option value="">Select teammate…</option>
                {TEAM_MEMBERS.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as TaskRole }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px]">
                <option value="Shooter">Shooter</option>
                <option value="Editor">Editor</option>
                <option value="Ads Manager">Ads Manager</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client</label>
              <select value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px]">
                <option value="">Select client…</option>
                {CLIENT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px]" />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] font-semibold text-slate-600">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-violet-600 text-white text-[13px] font-semibold">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, task: null })} title="Delete Task" size="sm">
        <div className="px-6 py-5">
          <p className="text-[13px] text-slate-600 mb-5">Are you sure you want to delete <span className="font-bold">"{deleteModal.task?.title}"</span>?</p>
          <div className="flex justify-end gap-2.5">
            <button onClick={() => setDeleteModal({ open: false, task: null })} className="px-4 py-2 text-[13px] font-semibold text-slate-600">Cancel</button>
            <button onClick={handleDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white text-[13px] font-semibold">Delete</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
