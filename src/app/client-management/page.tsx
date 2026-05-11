'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { STATIC_STRINGS, PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';

import ClientTable from './components/ClientTable';
import ClientModal from './components/ClientModal';
import PaymentModal from './components/PaymentModal';
import PaymentHistoryModal from './components/PaymentHistoryModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ClientSearch from './components/ClientSearch';

import { useClientManagement } from '@/api/hooks/useClientManagement';
import { getClientTotalPaid } from './types';

export default function ClientManagementPage() {
  useRoleGuard(PAGE_ROLES.CAMPAIGN_MANAGEMENT as unknown as UserRole[]);
  
  const {
    isOwner,
    isMounted,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    viewPaymentsOpen,
    setViewPaymentsOpen,
    activeClient,
    setActiveClient,
    paymentForm,
    setPaymentForm,
    deleteModal,
    setDeleteModal,
    editingClient,
    form,
    setForm,
    errors,
    setErrors,
    page,
    setPage,
    perPage,
    setPerPage,
    totalItems,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    filteredClients,
    finalTotalEntries,
    finalTotalPages,
    openAdd,
    openEdit,
    handleSave,
    handleDelete,
    openPayment,
    handleRecordPayment,
    handleDeletePayment,
    openDelete,
  } = useClientManagement();

  if (!isMounted) return null;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.CLIENT_MGMT_TITLE}</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{totalItems} {STATIC_STRINGS.CAMPAIGN_MGMT_TOTAL} {STATIC_STRINGS.CLIENTS}</p>
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

        <ClientSearch value={search} onChange={setSearch} />

        <ClientTable 
          clients={filteredClients}
          isFetching={isFetching}
          isOwner={isOwner}
          page={page}
          perPage={perPage}
          totalEntries={finalTotalEntries}
          totalPages={finalTotalPages}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onEdit={openEdit}
          onDelete={openDelete}
          onRecordPayment={openPayment}
          onViewPayments={(c) => { setActiveClient(c); setViewPaymentsOpen(true); }}
          getClientTotalPaid={getClientTotalPaid}
        />
      </div>

      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        activeClient={activeClient}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onSave={handleRecordPayment}
      />

      <PaymentHistoryModal 
        isOpen={viewPaymentsOpen}
        onClose={() => setViewPaymentsOpen(false)}
        activeClient={activeClient}
        onDeletePayment={handleDeletePayment}
        getClientTotalPaid={getClientTotalPaid}
      />

      <ClientModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingClient={editingClient}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        onSave={handleSave}
        isProcessing={isCreating || isUpdating}
      />

      <DeleteConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, client: null })}
        client={deleteModal.client}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
}
