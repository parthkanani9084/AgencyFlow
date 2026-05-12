'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Task, TaskStatus, Reel } from '@/types';
import { useCreateReel, useGetReels, useUpdateReelStatus } from '@/api/hooks/useReel';
import { useClients } from '@/api/hooks/useClient';
import { REEL_STATUS_MAP, COMMON_STATUS } from '@/utils/constants';
import { transformReelsToTasks, groupTasksByDate } from '../utils/dashboardUtils';

const DEBOUNCE_DELAY = 500;
const REELS_LIMIT = 50;

export function useSocialMediaDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TaskStatus | typeof COMMON_STATUS.ALL>(COMMON_STATUS.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: reelsData,
    isLoading: isReelsLoading,
    refetch: refetchReels,
  } = useGetReels({
    page: 1,
    limit: REELS_LIMIT,
    search: debouncedSearch.trim() || undefined,
    status: activeTab === COMMON_STATUS.ALL ? undefined : REEL_STATUS_MAP[activeTab],
  });

  const clientsList = useMemo(() => {
    const data = (clientsData as any)?.results?.data;
    if (!data || !Array.isArray(data)) return [];
    return data.map((client: any) => ({
      id: client.id,
      name: client.clientName ||'',
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
  const transformedTasks = useMemo(() => transformReelsToTasks(reels, user), [reels, user]);
  const groupedReels = useMemo(() => groupTasksByDate(transformedTasks), [transformedTasks]);

  const handleStatusChange = useCallback(
    async (task: Task, newStatus: TaskStatus) => {
      try {
        const apiStatus = REEL_STATUS_MAP[newStatus];
        await updateStatus({ id: task.id, status: apiStatus });
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
