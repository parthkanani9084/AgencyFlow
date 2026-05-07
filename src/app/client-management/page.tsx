'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { 
  Plus, Pencil, Trash2, Search, Briefcase, 
  AlertTriangle, X, IndianRupee, History 
} from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { useAdsData } from '@/context/AdsDataContext';
import { STATIC_STRINGS, PAGE_ROLES, ROLES } from '@/utils/constants';
import { UserRole } from '@/types';
import { useCreateClient, useUpdateClient, useDeleteClient } from '@/api/hooks/useClient';
import { clientService } from '@/api/services/client.service';

interface Payment {
  amount: number;
  date: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
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
  email: string;
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



const EMPTY_FORM: FormState = { 
  name: '', 
  email: '',
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

const SERVICE_OPTIONS = [
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_REELS, value: 'reels' },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_CAMPAIGN, value: 'campaign' },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_META, value: 'meta' },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_SOCIAL, value: 'social media' },
];

export default function ClientManagementPage() {
  useRoleGuard(PAGE_ROLES.CAMPAIGN_MANAGEMENT as unknown as UserRole[]);
  
  const { user } = useAuth();
  const { adsMetrics, updateAdsMetrics } = useAdsData();
  const isOwner = user?.role === ROLES.OWNER;

  const [clients, setClients] = useState<Client[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isFetching, setIsFetching] = useState(false);
  const { mutateAsync: createClient, isPending: isCreating } = useCreateClient();
  const { mutateAsync: updateClient, isPending: isUpdating } = useUpdateClient();
  const { mutateAsync: deleteClientAsync } = useDeleteClient();

  const fetchClients = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await clientService.getClients({ page, limit: perPage });
      const apiClients = response?.results?.data;
      if (apiClients) {
        const mapped: Client[] = apiClients.map((c: any) => ({
          id: c.id,
          name: c.clientName,
          email: c.email || '',
          brand: c.brandName,
          packageAmount: Number(c.packageAmount) || 0,
          perDaySpend: Number(c.perDaySpendAmount) || 0,
          planType: c.planType as 'monthly' | 'weekly' | 'yearly',
          adType: c.adType || '',
          platformType: (c.platformType === 'online' ? 'Website' : 'Offline') as 'Website' | 'Offline',
          location: c.fileLocation || '',
          websiteLink: c.weblink || '',
          reelsPerMonth: Number(c.reelsPerMonth) || 0,
          services: c.serviceRequired || [],
          payments: c.payments || [],
          createdAt: c.createdAt
        }));
        setClients(mapped);
        

        if (response.results?.pagination) {
          setTotalItems(response.results.pagination.totalItem || mapped.length);
          setTotalPages(response.results.pagination.totalPages || 1);
        } else {
          setTotalItems(mapped.length);
          setTotalPages(1);
        }
      }
    } catch (error: any) {
    } finally {
      setIsFetching(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    if (isMounted) {
      fetchClients();
    }
  }, [fetchClients, isMounted]);


  const filteredClients = useMemo(() => {
    const safeClients = clients || [];
    const query = search.toLowerCase().trim();
    if (!query) return safeClients;

    return safeClients.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.brand.toLowerCase().includes(query)
    );
  }, [clients, search]);

  const finalTotalEntries = search.trim() ? filteredClients.length : totalItems;
  const finalTotalPages = search.trim() ? Math.ceil(filteredClients.length / perPage) : totalPages;

  const paginatedClients = useMemo(() => {
    return filteredClients;
  }, [filteredClients]);

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


  useEffect(() => {
    setPage(1);
  }, [search]);


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
      email: client.email || '',
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
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = STATIC_STRINGS.CLIENT_MGMT_NAME_REQUIRED;
    if (!form.brand.trim()) e.brand = STATIC_STRINGS.CLIENT_MGMT_BRAND_REQUIRED;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = STATIC_STRINGS.FORM_EMAIL_REQUIRED;
    if (!form.packageAmount || isNaN(Number(form.packageAmount)) || Number(form.packageAmount) <= 0) {
      e.packageAmount = STATIC_STRINGS.CLIENT_MGMT_PACKAGE_REQUIRED;
    }
    if (!form.perDaySpend || isNaN(Number(form.perDaySpend)) || Number(form.perDaySpend) < 0) {
      e.perDaySpend = STATIC_STRINGS.CLIENT_MGMT_ERR_PER_DAY_SPEND;
    }
    if (!form.platformType) e.platformType = STATIC_STRINGS.CLIENT_MGMT_ERR_PLATFORM_TYPE;
    if (form.platformType === 'Website' && !form.websiteLink.trim()) e.websiteLink = STATIC_STRINGS.CLIENT_MGMT_ERR_WEBSITE_LINK;
    if (form.platformType === 'Offline' && !form.location.trim()) e.location = STATIC_STRINGS.CLIENT_MGMT_ERR_LOCATION;
    if (form.services.length === 0) e.services = STATIC_STRINGS.CLIENT_MGMT_ERR_SERVICES;
    if (form.services.includes('reels') && (!form.reelsPerMonth || Number(form.reelsPerMonth) <= 0)) {
      e.reelsPerMonth = STATIC_STRINGS.CLIENT_MGMT_ERR_REELS_PER_MONTH;
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const submissionData = {
      name: form.name.trim(),
      email: form.email.trim(),
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
      try {
        const payload: any = {};
        if (submissionData.name !== editingClient.name) payload.client_name = submissionData.name;
        if (submissionData.brand !== editingClient.brand) payload.brand_name = submissionData.brand;
        if (submissionData.email !== editingClient.email) payload.email = submissionData.email;
        if (JSON.stringify(submissionData.services.sort()) !== JSON.stringify([...editingClient.services].sort())) payload.service_required = submissionData.services;
        if (submissionData.packageAmount !== editingClient.packageAmount) payload.package_amount = submissionData.packageAmount;
        if (submissionData.perDaySpend !== editingClient.perDaySpend) payload.per_day_spend_amount = submissionData.perDaySpend;
        if (submissionData.planType !== editingClient.planType) payload.plan_type = submissionData.planType;
        if (submissionData.reelsPerMonth !== editingClient.reelsPerMonth) payload.reels_per_month = submissionData.reelsPerMonth;
        
        const platformValue = submissionData.platformType === 'Website' ? 'online' : 'offline';
        const oldPlatformValue = editingClient.platformType === 'Website' ? 'online' : 'offline';
        if (platformValue !== oldPlatformValue) payload.platform_type = platformValue;
        
        if (submissionData.websiteLink !== editingClient.websiteLink) payload.weblink = submissionData.websiteLink;
        if (submissionData.location !== editingClient.location) payload.file_location = submissionData.location;

        if (Object.keys(payload).length === 0) {
          setModalOpen(false);
          return;
        }

        await updateClient({
          clientId: editingClient.id,
          payload
        });

        setModalOpen(false);
        fetchClients(); 
      } catch (error: any) {
      }
    } else {
      try {
        const data = await createClient({
          client_name: submissionData.name,
          brand_name: submissionData.brand,
          email: submissionData.email,
          service_required: submissionData.services,
          package_amount: submissionData.packageAmount,
          per_day_spend_amount: submissionData.perDaySpend,
          plan_type: submissionData.planType,
          reels_per_month: submissionData.reelsPerMonth,
          platform_type: submissionData.platformType === 'Website' ? 'online' : 'offline',
          weblink: submissionData.websiteLink,
          file_location: submissionData.location,
        });

        const newClient: Client = {
          id: data.results?.id || `c${Date.now()}`,
          ...submissionData,
          payments: [],
          createdAt: new Date().toISOString().split('T')[0],
        };
        setClients(prev => [newClient, ...prev]);
        setModalOpen(false);
      } catch (error: any) {
      }
    }
  };

  const handleDelete = async () => {
    if (deleteModal.client) {
      try {
        await deleteClientAsync(deleteModal.client.id);
        fetchClients(); // Refresh list
      } catch (error: any) {
      }
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
      return;
    }

    const newAmount = Number(paymentForm.amount);
    const currentTotalPaid = getClientTotalPaid(activeClient);

    if (currentTotalPaid + newAmount > activeClient.packageAmount) {
      const remaining = activeClient.packageAmount - currentTotalPaid;
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
  };

  if (!isMounted) return null;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.CLIENT_MGMT_TITLE || 'Client Management'}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{(clients ? totalItems : 0)} {STATIC_STRINGS.CAMPAIGN_MGMT_TOTAL} clients</p>
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
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_CLIENT}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_BRAND}</th>
                  {isOwner && (
                    <>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.TABLE_PACKAGE}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.CLIENT_MGMT_TOTAL_PAID}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_PLAN}</th>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.ADS_TABLE_COL_ACTIONS}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan={isOwner ? 6 : 2} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Briefcase size={32} className="opacity-30" />
                        <p className="text-[13px]">{STATIC_STRINGS.CLIENT_MGMT_NO_CLIENTS}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client, idx) => {
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
                                  title={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_TOOLTIP}
                                >
                                  <IndianRupee size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveClient(client);
                                    setViewPaymentsOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                  title={STATIC_STRINGS.CLIENT_MGMT_VIEW_PAYMENTS_TOOLTIP}
                                >
                                  <History size={14} />
                                </button>
                                <button
                                  onClick={() => openEdit(client)}
                                  className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                                  title={STATIC_STRINGS.CLIENT_MGMT_EDIT_CLIENT_TOOLTIP}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => openDelete(client)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                  title={STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT_TOOLTIP}
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

          <Pagination
            currentPage={page}
            totalPages={finalTotalPages}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            totalEntries={finalTotalEntries}
            labels={{
              show: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_SHOW,
              of: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_OF,
              entries: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_ENTRIES
            }}
          />
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
              placeholder={STATIC_STRINGS.CLIENT_MGMT_PAYMENT_NOTES_PLACEHOLDER}
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
              {STATIC_STRINGS.CLIENT_MGMT_CLOSE}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Client Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? STATIC_STRINGS.CLIENT_MGMT_EDIT_CLIENT : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT}
        subtitle={editingClient ? STATIC_STRINGS.CLIENT_MGMT_MODAL_EDIT_SUBTITLE : STATIC_STRINGS.CLIENT_MGMT_MODAL_ADD_SUBTITLE}
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
                placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_NAME}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
              {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_BRAND_NAME} <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => { setForm(f => ({ ...f, brand: e.target.value })); setErrors(er => ({ ...er, brand: '' })); }}
                placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_BRAND}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
              {errors.brand && <p className="mt-1 text-[11.5px] text-red-500">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.FORM_EMAIL_ADDRESS} <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
                placeholder="e.g. client@test.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
              {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-2.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_SERVICES}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_OPTIONS.map((service) => (
                <label key={service.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.services.includes(service.value)}
                    onChange={(e) => {
                      const val = service.value;
                      setForm(f => ({
                        ...f,
                        services: e.target.checked ? [...f.services, val] : f.services.filter(s => s !== val)
                      }));
                      setErrors(er => ({ ...er, services: '' }));
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{service.label}</span>
                </label>
              ))}
            </div>
            {errors.services && <p className="mt-1 text-[11.5px] text-red-500">{errors.services}</p>}
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
                  placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_PACKAGE}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
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
                  onChange={(e) => { setForm(f => ({ ...f, perDaySpend: e.target.value })); setErrors(er => ({ ...er, perDaySpend: '' })); }}
                  placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_SPEND}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
              </div>
              {errors.perDaySpend && <p className="mt-1 text-[11.5px] text-red-500">{errors.perDaySpend}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLAN_TYPE} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {[
                { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_WEEKLY, value: 'weekly' },
                { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_MONTHLY, value: 'monthly' },
                { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_YEARLY, value: 'yearly' },
              ].map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, planType: plan.value as any }))}
                  className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold transition-all ${
                    form.planType === plan.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_REELS_PER_MONTH}</label>
              <input
                type="number"
                value={form.reelsPerMonth}
                onChange={(e) => { setForm(f => ({ ...f, reelsPerMonth: e.target.value })); setErrors(er => ({ ...er, reelsPerMonth: '' })); }}
                placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_REELS}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
              {errors.reelsPerMonth && <p className="mt-1 text-[11.5px] text-red-500">{errors.reelsPerMonth}</p>}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLATFORM_TYPE}</label>
              <select
                value={form.platformType}
                onChange={(e) => { setForm(f => ({ ...f, platformType: e.target.value as any })); setErrors(er => ({ ...er, platformType: '' })); }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              >
                <option value="">{STATIC_STRINGS.CLIENT_MGMT_SELECT_PLATFORM}</option>
                <option value="Website">{STATIC_STRINGS.CLIENT_MGMT_PLATFORM_WEBSITE}</option>
                <option value="Offline">{STATIC_STRINGS.CLIENT_MGMT_PLATFORM_OFFLINE}</option>
              </select>
              {errors.platformType && <p className="mt-1 text-[11.5px] text-red-500">{errors.platformType}</p>}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {form.platformType === 'Website' && (
                <>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">{STATIC_STRINGS.CLIENT_MGMT_LABEL_WEBSITE_LINK}</label>
                  <input
                    type="url"
                    value={form.websiteLink}
                    onChange={(e) => { setForm(f => ({ ...f, websiteLink: e.target.value })); setErrors(er => ({ ...er, websiteLink: '' })); }}
                    placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_WEBSITE}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                  />
                  {errors.websiteLink && <p className="mt-1 text-[11.5px] text-red-500">{errors.websiteLink}</p>}
                </>
              )}
              {form.platformType === 'Offline' && (
                <>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">{STATIC_STRINGS.CLIENT_MGMT_LABEL_LOCATION}</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => { setForm(f => ({ ...f, location: e.target.value })); setErrors(er => ({ ...er, location: '' })); }}
                    placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_LOCATION}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                  />
                  {errors.location && <p className="mt-1 text-[11.5px] text-red-500">{errors.location}</p>}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}</button>
            <button 
              onClick={handleSave} 
              disabled={isCreating || isUpdating}
              className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? STATIC_STRINGS.FORM_SAVING : (editingClient ? STATIC_STRINGS.CAMPAIGN_MGMT_SAVE_CHANGES : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT)}
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
