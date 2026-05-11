'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { UserRole } from '@/types';
import { ROLES, PAGE_ROLES } from '@/utils/constants';
import TaskCompletionModal from '@/components/TaskCompletionModal'
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskTable from './components/TaskTable';
import TaskFormModal from './components/TaskFormModal';
import DeleteTaskModal from './components/DeleteTaskModal';
import TaskHeader from './components/TaskHeader';
import { useTaskManagement } from './hooks/useTaskManagement';

export default function TaskManagementPage() {
  useRoleGuard(PAGE_ROLES.TASK_MANAGEMENT as unknown as UserRole[]);
  const [mounted, setMounted] = useState(false);
  
  const {
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
  } = useTaskManagement();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <TaskHeader 
          totalEntries={totalEntries} 
          isRestricted={isRestricted} 
          onAddClick={handleOpenAdd} 
        />

        <TaskStats stats={stats} />

        <TaskFilters 
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          isRestricted={isRestricted}
          userRole={user?.role}
          setPage={setPage}
        />

        <TaskTable 
          tasks={paginatedTasks}
          isLoading={isTasksLoading}
          isRestricted={isRestricted}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
          totalEntries={totalEntries}
          onEdit={handleOpenEdit}
          onDelete={(task) => setDeleteModal({ open: true, task })}
          onStatusChange={handleStatusChange}
          checkIsOverdue={checkIsOverdue}
        />
      </div>

      <TaskFormModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTask={editingTask}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        teamMembers={teamMembers}
        clientsList={clientsList}
        isFetchingTeam={isFetchingTeam}
        isFetchingClients={isFetchingClients}
        isSaving={isCreatingTask}
        handleMemberChange={handleMemberChange}
        handleSave={handleSave}
      />

      <DeleteTaskModal 
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, task: null })}
        task={deleteModal.task}
        onDelete={handleDelete}
      />

      <TaskCompletionModal
        open={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        task={selectedTaskForCompletion}
        onComplete={onCompleteTask}
        userRole={user?.role as UserRole || ROLES.MANAGER}
        teamMembers={teamMembers as any}
      />
    </AppLayout>
  );
}
