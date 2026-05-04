'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import { 
  Plus, Pencil, Trash2, Search, Briefcase, 
  AlertTriangle, X, IndianRupee, History 
} from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useAdsData } from '@/context/AdsDataContext';
import { toast, Toaster } from 'sonner';
import { STATIC_STRINGS, STORAGE_KEYS, PAGE_ROLES, ROLES } from '@/utils/constants';
import { UserRole } from '@/types';

interface Payment {
  amount: number;
  date: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  brand: string;
  packageAmount: number; 
  perDaySpend: number;   
  planType: 'monthly' | 'weekly' | 'yearly';
  adType?: string;
  platformType?: 'Website' | 'Offline';
  location?: string;
  websiteLink?: string;
  reelsPerMonth?: number;
  services: string[];
  payments: Payment[];
  createdAt: string;
}

interface FormState {
  name: string; 
  brand: string; 
  packageAmount: string; 
  perDaySpend: string; 
  planType: 'monthly' | 'weekly' | 'yearly';
  adType: string;
  platformType: 'Website' | 'Offline' | '';
  location: string;
  websiteLink: string;
  reelsPerMonth: string;
  services: string[];
}

// --- Constants ---
const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Jordan Lee', brand: 'NovaBrew Coffee', packageAmount: 120000, perDaySpend: 1500, planType: 'monthly', services: [], payments: [], createdAt: '2026-01-10' },
  { id: 'c2', name: 'Samantha Cruz', brand: 'PulseWear Apparel', packageAmount: 8500, perDaySpend: 50, planType: 'weekly', services: [], payments: [], createdAt: '2026-02-03' },
];

const EMPTY_FORM: FormState = { 
  name: '', 
  brand: '', 
  packageAmount: '', 
  perDaySpend: '', 
  planType: 'monthly',
  adType: '',
  platformType: '',
  location: '',
  websiteLink: '',
  reelsPerMonth: '',
  services: []
};

const SERVICE_OPTIONS = ['Reels', 'Campaign', 'Meta', 'Social Media'];

export default function ClientManagementPage() {
  useRoleGuard(PAGE_ROLES.CAMPAIGN_MANAGEMENT as unknown as UserRole[]);
  
  const { user } = useAuth();
  const { adsMetrics, updateAdsMetrics } = useAdsData();
  const isOwner = user?.role === ROLES.OWNER;

  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agencyflow_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    }
    return INITIAL_CLIENTS;
  });

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewPaymentsOpen, setViewPaymentsOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [paymentForm, setPaymentForm] = useState({ 
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    notes: '' 
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; client: Client | null }>({ 
    open: false, 
    client: null 
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    localStorage.setItem('agencyflow_clients', JSON.stringify(clients));
  }, [clients]);

  const getClientTotalPaid = useCallback((client: Client) => {
    return client.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  }, []);

  const updateGlobalRevenue = useCallback((updatedClients: Client[]) => {
    const newGlobalCollection = updatedClients.reduce((sum, client) => 
      sum + getClientTotalPaid(client), 0
    );

    updateAdsMetrics({
      ...adsMetrics,
      totalCollection: newGlobalCollection,
      totalSales: Math.max(adsMetrics.totalSales, newGlobalCollection),
      updatedAt: new Date().toISOString()
    });
  }, [adsMetrics, updateAdsMetrics, getClientTotalPaid]);

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.brand.toLowerCase().includes(query)
    );
  }, [clients, search]);


  const openAdd = () => {
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({ 
      name: client.name, 
      brand: client.brand, 
      packageAmount: String(client.packageAmount), 
      perDaySpend: String(client.perDaySpend || ''),
      planType: client.planType,
      adType: client.adType || '',
      platformType: client.platformType || '',
      location: client.location || '',
      websiteLink: client.websiteLink || '',
      reelsPerMonth: String(client.reelsPerMonth || ''),
      services: client.services || []
    });
    setErrors({});
    setModalOpen(true);
  };

  const openDelete = (client: Client) => setDeleteModal({ open: true, client });

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Client name is required';
    if (!form.brand.trim()) e.brand = 'Brand name is required';
    if (!form.packageAmount || isNaN(Number(form.packageAmount)) || Number(form.packageAmount) <= 0) {
      e.packageAmount = 'Enter a valid package amount';
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const submissionData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      packageAmount: Number(form.packageAmount),
      perDaySpend: Number(form.perDaySpend) || 0,
      planType: form.planType,
      adType: form.adType.trim(),
      platformType: form.platformType as 'Website' | 'Offline',
      location: form.location.trim(),
      websiteLink: form.websiteLink.trim(),
      reelsPerMonth: Number(form.reelsPerMonth) || 0,
      services: form.services
    };

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...submissionData } : c));
      toast.success(`Client "${submissionData.name}" updated`);
    } else {
      const newClient: Client = {
        id: `c${Date.now()}`,
        ...submissionData,
        payments: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients(prev => [newClient, ...prev]);
      toast.success(`Client "${submissionData.name}" added`);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal.client) {
      setClients(prev => prev.filter(c => c.id !== deleteModal.client!.id));
      toast.info(`Client "${deleteModal.client.name}" removed`);
    }
    setDeleteModal({ open: false, client: null });
  };
  const openPayment = (client: Client) => {
    setActiveClient(client);
    setPaymentForm({ 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      notes: '' 
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = () => {
    if (!activeClient || !paymentForm.amount || isNaN(Number(paymentForm.amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newAmount = Number(paymentForm.amount);
    const currentTotalPaid = getClientTotalPaid(activeClient);

    if (currentTotalPaid + newAmount > activeClient.packageAmount) {
      const remaining = activeClient.packageAmount - currentTotalPaid;
      toast.error(`${STATIC_STRINGS.CLIENT_MGMT_ERR_PAYMENT_EXCEEDS} (${STATIC_STRINGS.CURRENCY_SYMBOL}${activeClient.packageAmount.toLocaleString()}). Remaining: ${STATIC_STRINGS.CURRENCY_SYMBOL}${remaining.toLocaleString()}`);
      return;
    }

    const newPayment: Payment = {
      amount: newAmount,
      date: paymentForm.date, 
      notes: paymentForm.notes.trim()
    };

    const updatedClients = clients.map(c => {
      if (c.id === activeClient.id) {
        return { ...c, payments: [newPayment, ...(c.payments || [])] };
      }
      return c;
    });

    setClients(updatedClients);
    updateGlobalRevenue(updatedClients);
    setPaymentModalOpen(false);
    toast.success(`Payment of ${STATIC_STRINGS.CURRENCY_SYMBOL}${newAmount.toLocaleString()} recorded for ${activeClient.name}`);
  };

  const handleDeletePayment = (paymentIndex: number) => {
    if (!activeClient) return;

    const updatedClients = clients.map(c => {
      if (c.id === activeClient.id) {
        const newPayments = [...(c.payments || [])];
        newPayments.splice(paymentIndex, 1);
        return { ...c, payments: newPayments };
      }
      return c;
    });

    setClients(updatedClients);
    updateGlobalRevenue(updatedClients);
    
    const updatedActiveClient = updatedClients.find(c => c.id === activeClient.id);
    if (updatedActiveClient) setActiveClient(updatedActiveClient);
    toast.info('Payment entry removed');
  };

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.CLIENT_MGMT_TITLE || 'Client Management'}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{clients.length} {STATIC_STRINGS.CAMPAIGN_MGMT_TOTAL} clients</p>
          </div>
          {isOwner && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all duration-150 shadow-sm"
            >
              <Plus size={16} />
              {STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT}
            </button>
          )}
        </header>

        {/* Action Bar (Search & Filter) */}
        <section className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={STATIC_STRINGS.CLIENT_MGMT_SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </section>

        {/* Client Registry Table */}
        <main className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME.split(' ')[0]}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.CLIENT_MGMT_LABEL_BRAND_NAME.split(' ')[0]}</th>
                  {isOwner && (
                    <>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PACKAGE.split(' ')[0]}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.CLIENT_MGMT_TOTAL_PAID}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLAN_TYPE.split(' ')[0]}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.ADS_TABLE_COL_ACTIONS}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={isOwner ? 6 : 2} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Briefcase size={32} className="opacity-30" />
                        <p className="text-[13px]">{STATIC_STRINGS.CLIENT_MGMT_NO_CLIENTS}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, idx) => {
                    const totalPaid = getClientTotalPaid(client);
                    return (
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
                        {isOwner && (
                          <>
                            <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600 text-right">
                              {STATIC_STRINGS.CURRENCY_SYMBOL}{client.packageAmount.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-[13px] font-bold text-emerald-600 text-right">
                              {STATIC_STRINGS.CURRENCY_SYMBOL}{totalPaid.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  client.planType === 'monthly' ? 'bg-violet-100 text-violet-700' : 
                                  client.planType === 'weekly' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {client.planType.charAt(0).toUpperCase() + client.planType.slice(1)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openPayment(client)}
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Record Payment"
                                >
                                  <IndianRupee size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveClient(client);
                                    setViewPaymentsOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="View Payments"
                                >
                                  <History size={14} />
                                </button>
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
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT}
        subtitle={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_SUBTITLE}
        size="sm"
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME}</label>
            <input
              type="text"
              readOnly
              value={activeClient?.name || ''}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[13px] text-slate-600 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.ADS_TABLE_COL_SPEND} ({STATIC_STRINGS.CURRENCY_SYMBOL})</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CAMPAIGN_MGMT_NOTES}</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="Payment method, invoice #, etc."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}
            </button>
            <button
              onClick={handleRecordPayment}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150 shadow-sm"
            >
              {STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_BTN}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Payments Modal */}
      <Modal
        open={viewPaymentsOpen}
        onClose={() => setViewPaymentsOpen(false)}
        title={STATIC_STRINGS.CLIENT_MGMT_PAYMENT_HISTORY}
        subtitle={`${STATIC_STRINGS.CLIENT_MGMT_PAYMENT_HISTORY_SUBTITLE} ${activeClient?.name}`}
        size="md"
      >
        <div className="px-6 py-5">
          {!activeClient?.payments || activeClient.payments.length === 0 ? (
            <div className="py-10 text-center">
              <History size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[13px] text-slate-500">{STATIC_STRINGS.CLIENT_MGMT_NO_PAYMENTS}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{STATIC_STRINGS.CLIENT_MGMT_TOTAL_PAID}</p>
                  <p className="text-xl font-bold text-emerald-700">{STATIC_STRINGS.CURRENCY_SYMBOL}{getClientTotalPaid(activeClient).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{STATIC_STRINGS.CLIENT_MGMT_PENDING_BALANCE}</p>
                  <p className="text-xl font-bold text-slate-700">
                    {STATIC_STRINGS.CURRENCY_SYMBOL}{Math.max(0, activeClient.packageAmount - getClientTotalPaid(activeClient)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin border border-slate-100 rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeClient.payments.map((p, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-[12.5px] font-medium text-slate-500 whitespace-nowrap">
                          {(() => {
                            const date = new Date(p.date);
                            return isNaN(date.getTime()) ? p.date : date.toLocaleDateString('en-GB');
                          })()}
                        </td>
                        <td className="px-4 py-3 text-[12.5px] text-slate-400 italic">
                          <span className="line-clamp-1" title={p.notes}>{p.notes || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-slate-800 text-right">{STATIC_STRINGS.CURRENCY_SYMBOL}{p.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeletePayment(i)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setViewPaymentsOpen(false)}
              className="px-5 py-2 rounded-lg bg-violet-900 text-white text-[13px] font-semibold hover:bg-violet-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Client Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? STATIC_STRINGS.CLIENT_MGMT_EDIT_CLIENT : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT}
        subtitle={editingClient ? 'Update client details below' : 'Fill in the details to add a new client'}
        size="lg"
      >
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                placeholder="e.g. Jordan Lee"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
              {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_BRAND_NAME} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => { setForm(f => ({ ...f, brand: e.target.value })); setErrors(er => ({ ...er, brand: '' })); }}
                placeholder="e.g. NovaBrew Coffee"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.brand ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
              />
              {errors.brand && <p className="mt-1 text-[11.5px] text-red-500">{errors.brand}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-2.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_SERVICES}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_OPTIONS.map((service) => (
                <label key={service} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.services.includes(service.toLowerCase())}
                    onChange={(e) => {
                      const val = service.toLowerCase();
                      setForm(f => ({
                        ...f,
                        services: e.target.checked ? [...f.services, val] : f.services.filter(s => s !== val)
                      }));
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PACKAGE} <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">{STATIC_STRINGS.CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  value={form.packageAmount}
                  onChange={(e) => { setForm(f => ({ ...f, packageAmount: e.target.value })); setErrors(er => ({ ...er, packageAmount: '' })); }}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.packageAmount ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
                />
              </div>
              {errors.packageAmount && <p className="mt-1 text-[11.5px] text-red-500">{errors.packageAmount}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PER_DAY_SPEND}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">{STATIC_STRINGS.CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  value={form.perDaySpend}
                  onChange={(e) => setForm(f => ({ ...f, perDaySpend: e.target.value }))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLAN_TYPE} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {(['weekly', 'monthly', 'yearly'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, planType: plan }))}
                  className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold transition-all ${
                    form.planType === plan ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_AD_RUN}</label>
              <input
                type="text"
                value={form.adType}
                onChange={(e) => setForm(f => ({ ...f, adType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_REELS_PER_MONTH}</label>
              <input
                type="number"
                value={form.reelsPerMonth}
                onChange={(e) => setForm(f => ({ ...f, reelsPerMonth: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLATFORM_TYPE}</label>
              <select
                value={form.platformType}
                onChange={(e) => setForm(f => ({ ...f, platformType: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              >
                <option value="">Select Platform</option>
                <option value="Website">Website</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              {form.platformType === 'Website' && (
                <>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">Website Link</label>
                  <input
                    type="url"
                    value={form.websiteLink}
                    onChange={(e) => setForm(f => ({ ...f, websiteLink: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                  />
                </>
              )}
              {form.platformType === 'Offline' && (
                <>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-all shadow-sm">
              {editingClient ? STATIC_STRINGS.CAMPAIGN_MGMT_SAVE_CHANGES : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, client: null })} title={STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT} size="sm">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-[13.5px] text-slate-700 leading-relaxed">
                {STATIC_STRINGS.CLIENT_MGMT_DELETE_CONFIRM} <span className="font-semibold text-slate-900">&quot;{deleteModal.client?.name}&quot;</span>? {STATIC_STRINGS.CLIENT_MGMT_DELETE_DESC}
              </p>
              <p className="mt-2 text-[12px] text-red-600 font-medium">{STATIC_STRINGS.CLIENT_MGMT_DELETE_UNDONE}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-6">
            <button onClick={() => setDeleteModal({ open: false, client: null })} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}</button>
            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-all">{STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT}</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
