'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Megaphone, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CreateCampaignModal from './CreateCampaignModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditCampaignModal from './EditCampaignModal';
import LogPerformanceModal from './LogPerformanceModal';
import CampaignHistoryModal from './CampaignHistoryModal';
import Pagination from '@/components/ui/Pagination';
import CampaignFilters from './CampaignFilters';
import CampaignTableHead from './CampaignTableHead';
import CampaignTableRow from './CampaignTableRow';
import BulkActionBar from './BulkActionBar';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import {
  useDeleteCampaign,
  useGetCampaigns,
  useUpdateCampaign,
} from '@/api/hooks/useCampaign';
import { Campaign, SortField, SortDir, CampaignStatus, WorkflowStage, Platform } from '../types';
import { mapCampaignData, isDeadlineCritical } from '../utils';

export default function CampaignTable() {
  const { user } = useAuth();
  
  // Table State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [stageFilter, setStageFilter] = useState<WorkflowStage | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [perPage, setPerPage] = useState(10);

  // Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [logTarget, setLogTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Campaign | null>(null);

  // Queries & Mutations
  const { data: campaignResponse, isLoading: isFetching, refetch } = useGetCampaigns({
    page,
    limit: perPage,
    search: search || undefined,
    status: statusFilter || undefined,
    stage: stageFilter === 'in draft' ? 'in-draft' : (stageFilter || undefined),
    priority: priorityFilter || undefined,
  });

  const { mutate: deleteCampaign, mutateAsync: deleteCampaignAsync } = useDeleteCampaign();
  const { mutate: updateCampaign, mutateAsync: updateCampaignAsync } = useUpdateCampaign();

  const campaigns: Campaign[] = useMemo(() => {
    const dataArray = Array.isArray(campaignResponse)
      ? campaignResponse
      : Array.isArray(campaignResponse?.results)
      ? campaignResponse.results
      : Array.isArray((campaignResponse as any)?.results?.data)
      ? (campaignResponse as any).results.data
      : [];

    return dataArray.map(mapCampaignData);
  }, [campaignResponse]);

  const filtered = useMemo(() => {
    let data = [...campaigns];

    const hasFullAccess =
      user?.role === ROLES.OWNER ||
      user?.role === ROLES.MANAGER ||
      user?.role === ROLES.SUPER_ADMIN;
    if (!hasFullAccess && user) {
      data = data.filter((c) => c.assignee === user.name);
    }

  
    if (platformFilter) data = data.filter((c) => c.platform === platformFilter);

    if (sortField) {
      data.sort((a, b) => {
        let av = a[sortField] as string | number;
        let bv = b[sortField] as string | number;

        if (typeof av === 'string') av = av.replace(/[$,×]/g, '');
        if (typeof bv === 'string') bv = bv.replace(/[$,×]/g, '');

        const aNum = Number(av);
        const bNum = Number(bv);

        const cmp = isNaN(aNum) || isNaN(bNum) ? String(av).localeCompare(String(bv)) : aNum - bNum;

        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return data;
  }, [campaigns, platformFilter, sortField, sortDir]);

  const totalEntries = (campaignResponse as any)?.results?.pagination?.totalItem || filtered.length;
  const totalPages = (campaignResponse as any)?.results?.pagination?.totalPages || Math.ceil(totalEntries / (perPage || 1));
  const paginated: Campaign[] = campaigns;
  const hasFilters = !!(search || statusFilter || stageFilter || platformFilter || priorityFilter);

  // -- Handlers --
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((c) => c.id)));
  };

  const handleBulkAction = async (action: 'delete' | 'pause') => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (action === 'delete') {
      try {
        await Promise.all(ids.map((id) => deleteCampaignAsync(id as any)));
        setSelectedIds(new Set());
      } catch (error) {
      }
      return;
    }

    if (action === 'pause') {
      try {
        await Promise.all(
          ids.map((id) =>
            updateCampaignAsync({ campaignId: id, payload: { status: 'pause' } } as any)
          )
        );
        setSelectedIds(new Set());
      } catch (error) {
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await deleteCampaignAsync(deleteTarget.id);
      if (response) {
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = async () => {
    setCreateOpen(false);
  };

  const handleEditSuccess = async () => {
    setEditTarget(null);
    setLogTarget(null);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStageFilter('');
    setPriorityFilter('');
    setPlatformFilter('');
    setPage(1);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <header className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                {STATIC_STRINGS.CAMPAIGN_MGMT_TITLE}
              </h1>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                {filtered.length} {STATIC_STRINGS.CAMPAIGN_MGMT_TOTAL} ·{' '}
                {campaigns.filter((c) => c.status === 'active').length}{' '}
                {STATIC_STRINGS.CAMPAIGN_MGMT_ACTIVE}
              </p>
            </div>
            {user?.role !== ROLES.ADS_MANAGER && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150"
              >
                <Plus size={13} /> {STATIC_STRINGS.CAMPAIGN_MGMT_NEW}
              </button>
            )}
          </div>

          <CampaignFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            stageFilter={stageFilter}
            onStageFilterChange={setStageFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            onClearFilters={clearFilters}
            hasFilters={!!hasFilters}
          />
        </header>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12.5px]">
            <CampaignTableHead
              currentSort={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onSelectAll={toggleAll}
              isAllSelected={paginated.length > 0 && selectedIds.size === paginated.length}
            />
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan={12} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                      <p className="text-[14px] font-medium">
                        {STATIC_STRINGS.SA_DASHBOARD_LOADING}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Megaphone size={22} className="text-slate-400" />
                      </div>
                      <p className="text-[14px] font-semibold text-slate-600">
                        {STATIC_STRINGS.CAMPAIGN_MGMT_NO_CAMPAIGNS}
                      </p>
                      <p className="text-[12.5px] text-slate-400">
                        {STATIC_STRINGS.CAMPAIGN_MGMT_NO_CAMPAIGNS_DESC}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((campaign, idx) => (
                  <CampaignTableRow
                    key={campaign.id}
                    campaign={campaign}
                    idx={idx}
                    isSelected={selectedIds.has(campaign.id)}
                    onToggle={toggleRow}
                    onLog={setLogTarget}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onHistory={setHistoryTarget}
                    userRole={user?.role}
                    isCritical={isDeadlineCritical(campaign.deadline) && campaign.status === 'active'}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          totalEntries={totalEntries}
          labels={{
            show: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_SHOW,
            of: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_OF,
            entries: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_ENTRIES,
          }}
        />
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onAction={handleBulkAction}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      {editTarget && (
        <EditCampaignModal
          key={editTarget.id}
          open={!!editTarget}
          campaign={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {logTarget && (
        <LogPerformanceModal
          open={!!logTarget}
          campaign={logTarget}
          onClose={() => setLogTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {historyTarget && (
        <CampaignHistoryModal
          open={!!historyTarget}
          campaign={historyTarget as any}
          onClose={() => setHistoryTarget(null)}
        />
      )}
      <DeleteConfirmModal
        open={!!deleteTarget}
        campaignName={deleteTarget?.name || ''}
        isProcessing={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
