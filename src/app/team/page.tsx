'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Users, Plus, Pencil, Trash2, Search, X, Mail, Camera, Film, Megaphone, UserCheck, Crown, CheckCircle2, XCircle,  } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import type { UserRole } from '@/lib/types';
import Icon from '@/components/ui/AppIcon';


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
  Owner:        { color: 'text-violet-700', bg: 'bg-violet-100', icon: Crown },
  Manager:      { color: 'text-teal-700',   bg: 'bg-teal-100',   icon: UserCheck },
  Shooter:      { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Camera },
  Editor:       { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  'Ads Manager':{ color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
};

const avatarColors: Record<UserRole, string> = {
  Owner:        'bg-violet-600',
  Manager:      'bg-teal-600',
  Shooter:      'bg-blue-600',
  Editor:       'bg-purple-600',
  'Ads Manager':'bg-orange-600',
};

const ALL_ROLES: UserRole[] = ['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager'];

const initialMembers: TeamMember[] = [
  { id: 'm1', name: 'Alex Owens',    email: 'alex@agencyflow.io',   role: 'Owner',        status: 'active',   joinedAt: '2025-11-01', tasksCompleted: 42, tasksActive: 3 },
  { id: 'm2', name: 'Priya Sharma',  email: 'priya@agencyflow.io',  role: 'Manager',      status: 'active',   joinedAt: '2025-11-15', tasksCompleted: 28, tasksActive: 5 },
  { id: 'm3', name: 'Marco Reyes',   email: 'marco@agencyflow.io',  role: 'Shooter',      status: 'active',   joinedAt: '2025-12-01', tasksCompleted: 19, tasksActive: 2 },
  { id: 'm4', name: 'Jin Park',      email: 'jin@agencyflow.io',    role: 'Editor',       status: 'active',   joinedAt: '2025-12-10', tasksCompleted: 15, tasksActive: 3 },
  { id: 'm5', name: 'Sofia Nguyen',  email: 'sofia@agencyflow.io',  role: 'Ads Manager',  status: 'active',   joinedAt: '2026-01-05', tasksCompleted: 11, tasksActive: 2 },
  { id: 'm6', name: 'Daniel Kim',    email: 'daniel@agencyflow.io', role: 'Shooter',      status: 'inactive', joinedAt: '2026-02-01', tasksCompleted: 4,  tasksActive: 0 },
];

const emptyForm = { name: '', email: '', role: 'Shooter' as UserRole };

export default function TeamPage() {
  useRoleGuard(['Owner', 'Manager']);

  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: TeamMember | null }>({ open: false, member: null });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    byRole: ALL_ROLES.map((r) => ({ role: r, count: members.filter((m) => m.role === r).length })),
  };

  function openAdd() {
    setEditingMember(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditingMember(member);
    setForm({ name: member.name, email: member.email, role: member.role });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id ? { ...m, name: form.name.trim(), email: form.email.trim(), role: form.role } : m
        )
      );
      toast.success('Member updated');
    } else {
      const newMember: TeamMember = {
        id: `m${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0],
        tasksCompleted: 0,
        tasksActive: 0,
      };
      setMembers((prev) => [newMember, ...prev]);
      toast.success('Team member invited');
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (deleteModal.member) {
      setMembers((prev) => prev.filter((m) => m.id !== deleteModal.member!.id));
      toast.success('Member removed');
    }
    setDeleteModal({ open: false, member: null });
  }

  function toggleStatus(id: string) {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    );
  }

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-violet-600" />
              Team
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {stats.active} active · {stats.total} total members
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            Invite Member
          </button>
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
              placeholder="Search by name or email…"
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
              All
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
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px] font-medium">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden lg:table-cell">Tasks</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider hidden sm:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-slate-500 font-semibold text-[11px] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, idx) => {
                    const cfg = roleConfig[member.role];
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
                              <p className="text-[11px] text-slate-400">completed</p>
                            </div>
                            <div>
                              <p className="font-semibold text-amber-600 tabular-nums">{member.tasksActive}</p>
                              <p className="text-[11px] text-slate-400">active</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{member.joinedAt}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleStatus(member.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                              member.status === 'active' ?'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {member.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(member)}
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                              title="Edit member"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, member })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'Edit Member' : 'Invite Team Member'}
        subtitle={editingMember ? 'Update member details' : 'Add a new member to your agency team'}
        size="md"
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
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
              Email Address <span className="text-red-500">*</span>
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
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Role</label>
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
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors"
            >
              {editingMember ? 'Save Changes' : 'Send Invite'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, member: null })}
        title="Remove Member?"
        subtitle="This will remove the member from your team."
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
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
