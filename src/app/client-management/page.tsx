'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Search, Briefcase, AlertTriangle, X } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';

interface Client {
  id: string;
  name: string;
  brand: string;
  budget: number;
  planType: 'monthly' | 'weekly';
  createdAt: string;
}

const initialClients: Client[] = [
  { id: 'c1', name: 'Jordan Lee', brand: 'NovaBrew Coffee', budget: 12000, planType: 'monthly', createdAt: '2026-01-10' },
  { id: 'c2', name: 'Samantha Cruz', brand: 'PulseWear Apparel', budget: 8500, planType: 'weekly', createdAt: '2026-02-03' },
  { id: 'c3', name: 'Ethan Patel', brand: 'GreenRoot Organics', budget: 20000, planType: 'monthly', createdAt: '2026-02-18' },
  { id: 'c4', name: 'Mia Tanaka', brand: 'LuxeHome Decor', budget: 5000, planType: 'weekly', createdAt: '2026-03-05' },
];

const emptyForm = { name: '', brand: '', budget: '', planType: 'monthly\' as \'monthly\' | \'weekly' };

export default function ClientManagementPage() {
  useRoleGuard(['Owner', 'Manager']);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditingClient(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({ name: client.name, brand: client.brand, budget: String(client.budget), planType: client.planType });
    setErrors({});
    setModalOpen(true);
  }

  function openDelete(client: Client) {
    setDeleteModal({ open: true, client });
  }

  function validate() {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = 'Client name is required';
    if (!form.brand.trim()) e.brand = 'Brand name is required';
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) <= 0)
      e.budget = 'Enter a valid budget';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editingClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? { ...c, name: form.name.trim(), brand: form.brand.trim(), budget: Number(form.budget), planType: form.planType }
            : c
        )
      );
    } else {
      const newClient: Client = {
        id: `c${Date.now()}`,
        name: form.name.trim(),
        brand: form.brand.trim(),
        budget: Number(form.budget),
        planType: form.planType,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [newClient, ...prev]);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (deleteModal.client) {
      setClients((prev) => prev.filter((c) => c.id !== deleteModal.client!.id));
    }
    setDeleteModal({ open: false, client: null });
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Client Management</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{clients.length} clients total</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all duration-150 shadow-sm"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Client</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Brand</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Budget</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Plan</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400">Added</th>
                <th className="px-5 py-3 text-[11px] font-600 uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Briefcase size={32} className="opacity-30" />
                      <p className="text-[13px]">No clients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((client, idx) => (
                  <tr
                    key={client.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-violet-700">
                            {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[13.5px] font-semibold text-slate-800">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">{client.brand}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                      ${client.budget.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          client.planType === 'monthly' ?'bg-violet-100 text-violet-700' :'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {client.planType === 'monthly' ? 'Monthly' : 'Weekly'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-400">{client.createdAt}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                          title="Edit client"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(client)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete client"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        subtitle={editingClient ? 'Update client details below' : 'Fill in the details to add a new client'}
        size="md"
      >
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: '' })); }}
              placeholder="e.g. Jordan Lee"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Brand Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => { setForm((f) => ({ ...f, brand: e.target.value })); setErrors((er) => ({ ...er, brand: '' })); }}
              placeholder="e.g. NovaBrew Coffee"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.brand ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
            />
            {errors.brand && <p className="mt-1 text-[11.5px] text-red-500">{errors.brand}</p>}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Budget (USD) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => { setForm((f) => ({ ...f, budget: e.target.value })); setErrors((er) => ({ ...er, budget: '' })); }}
                placeholder="0"
                className={`w-full pl-7 pr-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.budget ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
            </div>
            {errors.budget && <p className="mt-1 text-[11.5px] text-red-500">{errors.budget}</p>}
          </div>

          {/* Plan Type */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Plan Type <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {(['monthly', 'weekly'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, planType: plan }))}
                  className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold transition-all ${
                    form.planType === plan
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150 shadow-sm"
            >
              {editingClient ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, client: null })} title="Delete Client" size="sm">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-[13.5px] text-slate-700 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-slate-900">&quot;{deleteModal.client?.name}&quot;</span>?
                All associated data will be permanently removed.
              </p>
              <p className="mt-2 text-[12px] text-red-600 font-medium">This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              onClick={() => setDeleteModal({ open: false, client: null })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150"
            >
              Delete Client
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
