'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Plus, Search, X, CheckSquare, AlertCircle, ChevronDown, Calendar, User, Filter, Pencil, Trash2, CheckCircle2, Circle, Timer, Camera, Film, Megaphone } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { Task, TaskStatus, TaskPriority, TaskRole } from '@/lib/types';



const roleConfig: Record<TaskRole, { color: string; bg: string; icon: React.ElementType }> = {
  Shooter: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Camera },
  Editor: { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  'Ads Manager': { color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
  Owner: { color: 'text-violet-700', bg: 'bg-violet-100', icon: User },
  Manager: { color: 'text-teal-700', bg: 'bg-teal-100', icon: User },
};

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100', icon: Timer },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  low: { label: 'Low', color: 'text-slate-500', dot: 'bg-slate-400' },
  medium: { label: 'Medium', color: 'text-amber-600', dot: 'bg-amber-400' },
  high: { label: 'High', color: 'text-red-600', dot: 'bg-red-500' },
};

const roleFilters: { label: string; value: TaskRole | 'all' }[] = [
  { label: 'All Roles', value: 'all' },
  { label: 'Shooter', value: 'Shooter' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Ads Manager', value: 'Ads Manager' },
];

const emptyForm = {
  title: '',
  assignedTo: '',
  role: 'Shooter' as TaskRole,
  client: '',
  campaign: '',
  deadline: '',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  description: '',
};

function isOverdue(deadline: string, status: TaskStatus) {
  return status !== 'completed' && new Date(deadline) < new Date();
}

export default function TaskManagementPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<TaskRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({});

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
      t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.campaign.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || t.role === roleFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  function openAdd() {
    setEditingTask(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      assignedTo: task.assignedTo,
      role: task.role,
      client: task.client,
      campaign: task.campaign,
      deadline: task.deadline,
      status: task.status,
      priority: task.priority,
      description: task.description || '',
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<Record<keyof typeof emptyForm, string>> = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    if (!form.assignedTo.trim()) e.assignedTo = 'Assigned person is required';
    if (!form.client.trim()) e.client = 'Client is required';
    if (!form.deadline) e.deadline = 'Deadline is required';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editingTask) {
      updateTask(editingTask.id, form);
    } else {
      addTask(form);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (deleteModal.task) {
      deleteTask(deleteModal.task.id);
    }
    setDeleteModal({ open: false, task: null });
  }

  function cycleStatus(task: Task) {
    const order: TaskStatus[] = ['pending', 'in_progress', 'completed'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    updateTask(task.id, { status: next });
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Task Management</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{tasks.length} tasks across all roles</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all duration-150 shadow-sm"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Stats Row */}
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

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {roleFilters.map((rf) => {
            const isActive = roleFilter === rf.value;
            const cfg = rf.value !== 'all' ? roleConfig[rf.value as TaskRole] : null;
            const RoleIcon = cfg?.icon;
            return (
              <button
                key={rf.value}
                onClick={() => setRoleFilter(rf.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all duration-150 border ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {RoleIcon && <RoleIcon size={13} />}
                {rf.label}
                <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {rf.value === 'all' ? tasks.length : tasks.filter((t) => t.role === rf.value).length}
                </span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-[12.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition w-48"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Task</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Assigned To</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Client / Campaign</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Deadline</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Priority</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <CheckSquare size={32} className="opacity-30" />
                      <p className="text-[13px]">No tasks found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((task, idx) => {
                  const statusCfg = statusConfig[task.status];
                  const StatusIcon = statusCfg.icon;
                  const roleCfg = roleConfig[task.role];
                  const RoleIcon = roleCfg.icon;
                  const priCfg = priorityConfig[task.priority];
                  const overdue = isOverdue(task.deadline, task.status);

                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                    >
                      {/* Task title */}
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className={`text-[13.5px] font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11.5px] text-slate-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-violet-700">
                              {task.assignedTo.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[12.5px] text-slate-700 whitespace-nowrap">{task.assignedTo}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${roleCfg.bg} ${roleCfg.color}`}>
                          <RoleIcon size={10} />
                          {task.role}
                        </span>
                      </td>

                      {/* Client / Campaign */}
                      <td className="px-5 py-3.5 max-w-[160px]">
                        <p className="text-[12.5px] font-semibold text-slate-700 truncate">{task.client}</p>
                        <p className="text-[11.5px] text-slate-400 truncate">{task.campaign}</p>
                      </td>

                      {/* Deadline */}
                      <td className="px-5 py-3.5">
                        <div className={`flex items-center gap-1.5 ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                          {overdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
                          <span className="text-[12.5px] font-medium whitespace-nowrap">{task.deadline}</span>
                        </div>
                        {overdue && (
                          <span className="text-[10.5px] text-red-500 font-semibold">Overdue</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${priCfg.dot} flex-shrink-0`} />
                          <span className={`text-[12.5px] font-semibold ${priCfg.color}`}>{priCfg.label}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => cycleStatus(task)}
                          title="Click to advance status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all hover:opacity-80 active:scale-95 ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          <StatusIcon size={11} />
                          {statusCfg.label}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(task)}
                            className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                            title="Edit task"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, task })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete task"
                          >
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

        {filtered.length > 0 && (
          <p className="text-[12px] text-slate-400 mt-3 text-right">
            Showing {filtered.length} of {tasks.length} tasks
          </p>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        subtitle={editingTask ? 'Update task details below' : 'Fill in the details to create a new task'}
        size="lg"
      >
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: '' })); }}
              placeholder="e.g. Shoot product photos for NovaBrew"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.title && <p className="mt-1 text-[11.5px] text-red-500">{errors.title}</p>}
          </div>

          {/* Assigned To + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Assigned To <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.assignedTo}
                onChange={(e) => { setForm((f) => ({ ...f, assignedTo: e.target.value })); setErrors((er) => ({ ...er, assignedTo: '' })); }}
                placeholder="e.g. Marco Reyes"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.assignedTo ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
              {errors.assignedTo && <p className="mt-1 text-[11.5px] text-red-500">{errors.assignedTo}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as TaskRole }))}
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition cursor-pointer"
                >
                  <option value="Shooter">Shooter</option>
                  <option value="Editor">Editor</option>
                  <option value="Ads Manager">Ads Manager</option>
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Client + Campaign */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.client}
                onChange={(e) => { setForm((f) => ({ ...f, client: e.target.value })); setErrors((er) => ({ ...er, client: '' })); }}
                placeholder="e.g. Jordan Lee"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.client ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
              {errors.client && <p className="mt-1 text-[11.5px] text-red-500">{errors.client}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign</label>
              <input
                type="text"
                value={form.campaign}
                onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))}
                placeholder="e.g. NovaBrew Spring Launch"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
          </div>

          {/* Deadline + Priority + Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => { setForm((f) => ({ ...f, deadline: e.target.value })); setErrors((er) => ({ ...er, deadline: '' })); }}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
              {errors.deadline && <p className="mt-1 text-[11.5px] text-red-500">{errors.deadline}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional task notes or instructions…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition shadow-sm active:scale-[0.98]"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, task: null })}
        title="Delete Task"
        subtitle="This action cannot be undone"
        size="sm"
      >
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 mb-5">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700">
              Are you sure you want to delete <span className="font-semibold">"{deleteModal.task?.title}"</span>? This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={() => setDeleteModal({ open: false, task: null })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition shadow-sm active:scale-[0.98]"
            >
              Delete Task
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
