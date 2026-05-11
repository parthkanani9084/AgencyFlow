import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdsData } from '@/context/AdsDataContext';
import { STATIC_STRINGS, ROLES, CLIENT_PLANS, CLIENT_PLATFORMS } from '@/utils/constants';
import { clientService } from '../services/client.service';
import { Client, FormState, EMPTY_FORM, getClientTotalPaid } from '@/app/client-management/types';
import { useCreateClient, useUpdateClient, useDeleteClient } from './useClient';
import { validateClientForm, prepareClientPayload } from './clientUtils';

export const useClientManagement = () => {
  const { user } = useAuth();
  const { adsMetrics, updateAdsMetrics } = useAdsData();
  const isOwner = user?.role === ROLES.OWNER;
  const [clients, setClients] = useState<Client[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewPaymentsOpen, setViewPaymentsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { mutateAsync: createClient, isPending: isCreating } = useCreateClient();
  const { mutateAsync: updateClient, isPending: isUpdating } = useUpdateClient();
  const { mutateAsync: deleteClientAsync, isPending: isDeleting } = useDeleteClient();
  
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await clientService.getClients({ 
        page, 
        limit: perPage, 
        search: debouncedSearch.trim() || undefined 
      });
      const apiClients = response?.results?.data;
      if (apiClients) {
        const mapped: Client[] = apiClients.map((c: any) => ({
          id: c.id,
          name: c.clientName,
          email: c.email || '',
          brand: c.brandName,
          packageAmount: Number(c.packageAmount) || 0,
          perDaySpend: Number(c.perDaySpendAmount) || 0,
          planType: c.planType as typeof CLIENT_PLANS[keyof typeof CLIENT_PLANS],
          adType: c.adType || '',
          platformType: (c.platformType === STATIC_STRINGS.CLIENT_MGMT_PLATFORM_ONLINE ? CLIENT_PLATFORMS.WEBSITE : CLIENT_PLATFORMS.OFFLINE) as typeof CLIENT_PLATFORMS.WEBSITE | typeof CLIENT_PLATFORMS.OFFLINE,
          location: c.fileLocation || '',
          websiteLink: c.weblink || '',
          reelsPerMonth: Number(c.reelsPerMonth) || 0,
          services: c.serviceRequired || [],
          payments: c.payments || [],
          createdAt: c.createdAt
        }));
        setClients(mapped);
        setTotalItems(response.results?.pagination?.totalItem || mapped.length);
        setTotalPages(response.results?.pagination?.totalPages || 1);
      }
    } catch (error) {
    } finally {
      setIsFetching(false);
    }
  }, [page, perPage, debouncedSearch]);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (isMounted) fetchClients(); }, [fetchClients, isMounted]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const filteredClients = useMemo(() => clients || [], [clients]);

  const updateGlobalRevenue = useCallback((updatedClients: Client[]) => {
    const newGlobalCollection = updatedClients.reduce((sum, client) => sum + getClientTotalPaid(client), 0);
    updateAdsMetrics({
      ...adsMetrics,
      totalCollection: newGlobalCollection,
      totalSales: Math.max(adsMetrics.totalSales, newGlobalCollection),
      updatedAt: new Date().toISOString()
    });
  }, [adsMetrics, updateAdsMetrics]);

  const openAdd = useCallback(() => {
    setEditingClient(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name, email: client.email || '', brand: client.brand,
      packageAmount: String(client.packageAmount), perDaySpend: String(client.perDaySpend || ''),
      planType: client.planType, adType: client.adType || '',
      platformType: client.platformType || '', location: client.location || '',
      websiteLink: client.websiteLink || '', reelsPerMonth: String(client.reelsPerMonth || ''),
      services: client.services || []
    });
    setErrors({});
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    const e = validateClientForm(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const { submissionData, payload } = prepareClientPayload(form, editingClient);

    try {
      if (editingClient) {
        if (Object.keys(payload).length > 0) {
          await updateClient({ clientId: editingClient.id, payload });
          fetchClients();
        }
      } else {
        await createClient(payload);
        fetchClients();
      }
      setModalOpen(false);
    } catch (error) { }
  }, [form, editingClient, updateClient, createClient, fetchClients]);

  const handleDelete = useCallback(async () => {
    if (deleteModal.client) {
      try {
        await deleteClientAsync(deleteModal.client.id);
        fetchClients();
      } catch (error) { }
    }
    setDeleteModal({ open: false, client: null });
  }, [deleteModal.client, deleteClientAsync, fetchClients]);

  const openPayment = useCallback((client: Client) => {
    setActiveClient(client);
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setPaymentModalOpen(true);
  }, []);

  const handleRecordPayment = useCallback(() => {
    if (!activeClient || !paymentForm.amount || isNaN(Number(paymentForm.amount))) return;
    const newAmount = Number(paymentForm.amount);
    if (getClientTotalPaid(activeClient) + newAmount > activeClient.packageAmount) return;

    const updatedClients = clients.map(c => c.id === activeClient.id ? { ...c, payments: [{ amount: newAmount, date: paymentForm.date, notes: paymentForm.notes.trim() }, ...(c.payments || [])] } : c);
    setClients(updatedClients);
    updateGlobalRevenue(updatedClients);
    setPaymentModalOpen(false);
  }, [activeClient, paymentForm, clients, updateGlobalRevenue]);

  const handleDeletePayment = useCallback((paymentIndex: number) => {
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
  }, [activeClient, clients, updateGlobalRevenue]);

  return {
    isOwner, isMounted, clients, search, setSearch, modalOpen, setModalOpen, paymentModalOpen, setPaymentModalOpen,
    viewPaymentsOpen, setViewPaymentsOpen, activeClient, setActiveClient, paymentForm, setPaymentForm, deleteModal, setDeleteModal,
    editingClient, form, setForm, errors, setErrors, page, setPage, perPage, setPerPage, totalItems, totalPages,
    isFetching, isCreating, isUpdating, isDeleting, filteredClients,
    finalTotalEntries: search.trim() ? filteredClients.length : totalItems,
    finalTotalPages: search.trim() ? Math.ceil(filteredClients.length / perPage) : totalPages,
    openAdd, openEdit, handleSave, handleDelete, openPayment, handleRecordPayment, handleDeletePayment,
    openDelete: (c: Client) => setDeleteModal({ open: true, client: c }),
  };
};
