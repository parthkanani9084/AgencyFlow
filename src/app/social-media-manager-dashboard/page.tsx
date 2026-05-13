'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { UserRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import ReelsSchedule from './components/ReelsSchedule';
import AddReelModal from './components/AddReelModal';
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardFilters from './components/DashboardFilters';
import { useSocialMediaDashboard } from './hooks/useSocialMediaDashboard';
import { ROLES, PAGE_ROLES } from '@/utils/constants';

export default function SocialMediaManagerDashboardPage() {
  useRoleGuard(PAGE_ROLES.SOCIAL_MEDIA_DASHBOARD as readonly UserRole[]);

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    selectedTask,
    setIsTaskModalOpen,
    isTaskModalOpen,
    newReelForm,
    formErrors,
    isReelsLoading,
    isUpdatingStatus,
    isFetchingClients,
    clientsList,
    groupedReels,
    stats,
    handleStatusChange,
    handleCloseAddModal,
    handleFormChange,
    handleAddReel,
    refetchReels,
    isCreatingReel,
  } = useSocialMediaDashboard();

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <DashboardHeader onAddReel={() => setIsAddModalOpen(true)} />

        <DashboardStats stats={stats} />

        <DashboardFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <ReelsSchedule
          groupedReels={groupedReels}
          onStatusChange={handleStatusChange}
          isLoading={isReelsLoading || isUpdatingStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <TaskCompletionModal
          open={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          onComplete={() => {
            setIsTaskModalOpen(false);
            refetchReels();
          }}
          userRole={ROLES.SOCIAL_MEDIA_MANAGER}
          teamMembers={[]}
        />

        <AddReelModal
          open={isAddModalOpen}
          onClose={handleCloseAddModal}
          form={newReelForm}
          errors={formErrors}
          clients={clientsList}
          isFetchingClients={isFetchingClients}
          isCreating={isCreatingReel}
          onChange={handleFormChange}
          onSubmit={handleAddReel}
        />
      </div>
    </AppLayout>
  );
}
