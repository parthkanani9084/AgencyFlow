'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import Modal from '@/components/ui/Modal';
import Label from '@/components/ui/Label';
import { STATIC_STRINGS, ROLES, PAGE_ROLES } from '@/utils/constants';
import { UserRole } from '@/types';
import TaskCompletionModal from '@/components/TaskCompletionModal';
import ReelsSchedule from './components/ReelsSchedule';
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardFilters from './components/DashboardFilters';
import { useSocialMediaDashboard } from './hooks/useSocialMediaDashboard';

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

        <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={STATIC_STRINGS.SMM_MODAL_TITLE} size="md">
          <div className="p-6 space-y-5">
            <div>
              <Label className="font-bold mb-2" style={{ fontSize: '13px' }}>{STATIC_STRINGS.SMM_LABEL_TITLE}</Label>
              <input 
                type="text"
                placeholder={STATIC_STRINGS.SMM_PLACEHOLDER_TITLE}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all ${
                  formErrors.title ? 'border-red-500 bg-red-50' : 'border-slate-200'
                }`}
                value={newReelForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold mb-2" style={{ fontSize: '13px' }}>{STATIC_STRINGS.SMM_LABEL_CLIENT}</Label>
                <select 
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all cursor-pointer ${
                    formErrors.campaignId ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={newReelForm.campaignId}
                  onChange={(e) => handleFormChange('campaignId', e.target.value)}
                >
                  <option value="">{isFetchingClients ? 'Loading clients...' : STATIC_STRINGS.SMM_PLACEHOLDER_CLIENT}</option>
                  {clientsList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="font-bold mb-2" style={{ fontSize: '13px' }}>{STATIC_STRINGS.SMM_LABEL_DATE}</Label>
                <input 
                  type="date"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all ${
                    formErrors.scheduledDate ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  }`}
                  value={newReelForm.scheduledDate}
                  onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {STATIC_STRINGS.SMM_BTN_CANCEL}
              </button>
              <button 
                onClick={handleAddReel}
                disabled={isCreatingReel}
                className="px-6 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-[13px] font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingReel ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : STATIC_STRINGS.SMM_BTN_SCHEDULE}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
