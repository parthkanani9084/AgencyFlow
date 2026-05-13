'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Reel } from '@/types';
import { useCreateReel, useGetReels, useUpdateReelStatus } from '@/api/hooks/useReel';
import { useClients } from '@/api/hooks/useClient';
import { REEL_STATUSES, REEL_CONSTANTS } from '@/utils/constants';
import { groupReelsByDate } from '../utils/dashboardUtils';

export function useSocialMediaDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(REEL_STATUSES.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Reel | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReelForm, setNewReelForm] = useState({ title: '', campaignId: '', scheduledDate: '' });
  const [formErrors, setFormErrors] = useState({ title: false, campaignId: false, scheduledDate: false });
  
  const { mutateAsync: createReel, isPending: isCreatingReel } = useCreateReel();
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateReelStatus();
  const { data: clientsData, isLoading: isFetchingClients } = useClients({});


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, REEL_CONSTANTS.DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: reelsData,
    isLoading: isReelsLoading,
    refetch: refetchReels,
  } = useGetReels({
    page: 1,
    limit: REEL_CONSTANTS.REELS_LIMIT,
    search: debouncedSearch.trim() || undefined,
    status: activeTab === REEL_STATUSES.ALL ? undefined : activeTab,
    sortorder: REEL_CONSTANTS.DEFAULT_SORT,
  });

  const clientsList = useMemo(() => {
    const data = (clientsData as any)?.results?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((client: any) => ({
      id: client.id,
      name: client.clientName || '',
    }));
  }, [clientsData]);

  const stats = useMemo(() => {
    const counts = reelsData?.results?.counts;
    return counts ? {
      pending: counts.schedule || 0,
      inProgress: counts.production || 0,
      completed: counts.uploaded || 0,
    } : { pending: 0, inProgress: 0, completed: 0 };
  }, [reelsData]);

  const reels = useMemo<Reel[]>(() => (reelsData?.results?.data as Reel[]) || [], [reelsData]);
  const groupedReels = useMemo(() => groupReelsByDate(reels), [reels]);

  const handleStatusChange = useCallback(
    async (reel: Reel, newStatus: string) => {
      try {
        await updateStatus({ id: reel.id, status: newStatus });
        refetchReels();
      } catch (error) {}
    },
    [updateStatus, refetchReels]
  );

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setNewReelForm({ title: '', campaignId: '', scheduledDate: '' });
    setFormErrors({ title: false, campaignId: false, scheduledDate: false });
  }, []);

  const handleFormChange = useCallback((field: string, value: string) => {
    setNewReelForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: false }));
  }, []);

  const handleAddReel = async () => {
    if (!user) return;
    const errors = {
      title: !newReelForm.title.trim(),
      campaignId: !newReelForm.campaignId,
      scheduledDate: !newReelForm.scheduledDate,
    };
    setFormErrors(errors);
    if (Object.values(errors).some((hasError) => hasError)) return;

    try {
      await createReel({
        title: newReelForm.title,
        client_id: newReelForm.campaignId,
        publish_date: newReelForm.scheduledDate,
      });
      refetchReels();
      handleCloseAddModal();
    } catch (error) {}
  };

  return {
    user,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isAddModalOpen,
    setIsAddModalOpen,
    selectedTask,
    setSelectedTask,
    isTaskModalOpen,
    setIsTaskModalOpen,
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
  };
}
