'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit2,
  Trash2,
  X,
  Download,
  Megaphone,
  TrendingUp,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import CreateCampaignModal from './CreateCampaignModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditCampaignModal from './EditCampaignModal';
import LogPerformanceModal from './LogPerformanceModal';
import CampaignHistoryModal from './CampaignHistoryModal';
import Pagination from '@/components/ui/Pagination';
import {
  STATIC_STRINGS,
  ROLES,
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_STAGE_OPTIONS,
} from '@/utils/constants';
import { CAMPAIGN_STATUS_STYLES, CAMPAIGN_STAGE_STYLES, PLATFORM_STYLES } from '@/utils/ui-configs';
import { useGetCampaigns } from '@/api/hooks/useCreateCampaign';
import { campaignService } from '@/api/services/campaign.service';
import { useDeleteCampaign } from '@/api/hooks/useCreateCampaign';

type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed' | 'archived';
type WorkflowStage = 'in draft' | 'in review' | 'process' | 'publish';
type Platform = 'Meta' | 'Facebook' | 'Instagram' | 'Google' | 'TikTok' | 'LinkedIn' | 'Multi';

interface Campaign {
  id: string;
  name: string;
  client: string;
  status: CampaignStatus;
  stage: WorkflowStage;
  assignee: string;
  assigneeInitials: string;
  deadline: string;
  spend: string;
  budget: string;
  leads: number;
  roas: number;
  platform: Platform;
  createdAt: string;
  auditLogs?: any[];
  performanceHistory?: {
    id: string;
    date: string;
    addedSpend: number;
    addedLeads: number;
    newRoas: number;
  }[];
}

type SortField = 'name' | 'client' | 'deadline' | 'leads' | 'roas' | 'spend';
type SortDir = 'asc' | 'desc';


export default function CampaignTable() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [clientFilter, setClientFilter] = useState('');
  const [stageFilter, setStageFilter] = useState<WorkflowStage | ''>('');
  const [platformFilter, setPlatformFilter] = useState<Platform | ''>('');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [logTarget, setLogTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Campaign | null>(null);
   const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clientOptions = useMemo(
    () => [...new Set(campaigns.map((c) => c.client))].sort(),
    [campaigns]
  );

  const filtered = useMemo(() => {
    let data = [...campaigns];

    const hasFullAccess =
      user?.role === ROLES.OWNER ||
      user?.role === ROLES.MANAGER ||
      user?.role === ROLES.SUPER_ADMIN;
    if (!hasFullAccess && user) {
      data = data.filter((c) => c.assignee === user.name);
    }

    const searchLower = search.toLowerCase();
    if (search) {
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) || c.client.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) data = data.filter((c) => c.status === statusFilter);
    if (clientFilter) data = data.filter((c) => c.client === clientFilter);
    if (stageFilter) data = data.filter((c) => c.stage === stageFilter);
    if (platformFilter) data = data.filter((c) => c.platform === platformFilter);

    // Sorting Logic
    data.sort((a, b) => {
      let av = a[sortField] as string | number;
      let bv = b[sortField] as string | number;

      // Normalize strings that represent numeric values
      if (typeof av === 'string') av = av.replace(/[$,×]/g, '');
      if (typeof bv === 'string') bv = bv.replace(/[$,×]/g, '');

      const aNum = Number(av);
      const bNum = Number(bv);

      const cmp = isNaN(aNum) || isNaN(bNum) ? String(av).localeCompare(String(bv)) : aNum - bNum;

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [
    campaigns,
    user,
    search,
    statusFilter,
    clientFilter,
    stageFilter,
    platformFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const hasFilters = search || statusFilter || clientFilter || stageFilter || platformFilter;

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

  if (action === 'delete') {
    const ids = Array.from(selectedIds);

    try {
      await Promise.all(ids.map((id) => campaignService.deleteCampaign(id)));

      setCampaigns((prev) => prev.filter((c) => !selectedIds.has(c.id)));
      setSelectedIds(new Set());

      // optional: fresh data from backend
      fetchCampaigns();
    } catch (error) {
    }

    return;
  }

  setCampaigns((prev) =>
    prev.map((c) => (selectedIds.has(c.id) ? { ...c, status: 'paused' } : c))
  );

  toast.success(`${selectedIds.size} ${STATIC_STRINGS.CAMPAIGN_MGMT_PAUSED_TOAST}`);
  setSelectedIds(new Set());
};


 const { mutate: deleteCampaign, isPending: isDeleting } =
  useDeleteCampaign();

const confirmDelete = async () => {
  if (!deleteTarget?.id) return;

  deleteCampaign(deleteTarget.id, {
    onSuccess: () => {
      fetchCampaigns();
      setCampaigns((prev) =>
        prev.filter(({ id }) => id !== deleteTarget.id)
      );
      setDeleteTarget(null);
    },
  });
};
  const handleStatusChange = (campaignId: string, newStatus: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
    );
    setStatusDropdownId(null);
    toast.success(STATIC_STRINGS.CAMPAIGN_MGMT_STATUS_UPDATED);
  };

  const handleCreateSuccess = async () => {
  setCreateOpen(false);
  await fetchCampaigns();
};


  const handleEditSuccess =  async (updated: Campaign) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditTarget(null);
    await fetchCampaigns();
    toast.success(STATIC_STRINGS.CAMPAIGN_MGMT_UPDATED_TOAST);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setClientFilter('');
    setStageFilter('');
    setPlatformFilter('');
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-violet-600" />
    ) : (
      <ChevronDown size={12} className="text-violet-600" />
    );
  };

  const isDeadlineCritical = (deadline: string) => {
    const d = new Date(deadline);
    const now = new Date('2026-04-09');
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  };
  
 const fetchCampaigns = async () => {
  setIsFetching(true);

  try {
    const { results } = await campaignService.getCampaigns({
      page,
      limit: perPage,
    });

    const mappedCampaigns: Campaign[] =
      results?.data?.map((c: any) => {
        const assigneeName =
          c.assignee?.fullName || c.assignedTo || 'NA';

        return {
          id: c.id,
          name: c.campaignName,
          client: c.client?.clientName,
          status: c.status,
          stage:
            c.stage === 'in-draft'
              ? 'in draft'
              : c.stage,

          assignee: assigneeName,

          assigneeInitials: assigneeName
            .split(' ')
            .map((n: string) => n.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase(),

          deadline: c.deadlineDate
            ? new Intl.DateTimeFormat('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              }).format(new Date(c.deadlineDate))
            : '-',

          spend: '$0',
          budget: `$${Number(
            c.dailyBudget ?? 0
          ).toLocaleString()}`,

          leads: 0,
          roas: 0,

          platform:
            c.adsPlatform?.length > 1
              ? 'Multi'
              : c.adsPlatform?.[0] || 'Meta',

          createdAt: c.createdAt,
        };
      }) || [];

    setCampaigns(mappedCampaigns);
  } catch (error) {
    toast.error('Failed to fetch campaigns');
  } finally {
    setIsFetching(false);
  }
};

useEffect(() => {
  fetchCampaigns();
}, [page, perPage]);


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
            <div className="flex items-center gap-2">
              {/* <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-colors">
                <Download size={13} /> {STATIC_STRINGS.CAMPAIGN_MGMT_EXPORT}
              </button> */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150"
              >
                <Plus size={13} /> {STATIC_STRINGS.CAMPAIGN_MGMT_NEW}
              </button>
            </div>
          </div>

          {/* Filtering Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={STATIC_STRINGS.CAMPAIGN_MGMT_SEARCH_PLACEHOLDER}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CampaignStatus | '');
                setPage(1);
              }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
            >
              <option value="">{STATIC_STRINGS.CAMPAIGN_MGMT_ALL_STATUSES}</option>
              {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

           <select
  value={clientFilter}
  onChange={(e) => {
    setClientFilter(e.target.value);
    setPage(1);
  }}
  className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
>
  <option value="">
    {STATIC_STRINGS.CAMPAIGN_MGMT_ALL_CLIENTS}
  </option>

  {clientOptions.map((c, index) => (
    <option key={`${c}-${index}`} value={c}>
      {c}
    </option>
  ))}
</select>

            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value as WorkflowStage | '');
                setPage(1);
              }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 hover:border-slate-300 outline-none cursor-pointer transition-all"
            >
              <option value="">{STATIC_STRINGS.CAMPAIGN_MGMT_ALL_STAGES}</option>
              {CAMPAIGN_STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-[12px] text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={12} /> {STATIC_STRINGS.FORM_CANCEL}
              </button>
            )}
          </div>
        </header>

        {/* Data Table */}
        <div className="overflow-x-auto scrollbar-thin" onClick={() => setStatusDropdownId(null)}>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-violet-600 cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_NAME} <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('client')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT} <SortIcon field="client" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  {STATIC_STRINGS.CAMPAIGN_FIELD_STATUS}
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold whitespace-nowrap">
                  {STATIC_STRINGS.CAMPAIGN_FIELD_STAGE}
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  {STATIC_STRINGS.CAMPAIGN_FIELD_ASSIGNEE}
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  {STATIC_STRINGS.CAMPAIGN_FIELD_PLATFORM}
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('deadline')}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_DEADLINE} <SortIcon field="deadline" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('spend')}
                    className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_SPEND} <SortIcon field="spend" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('leads')}
                    className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_LEADS} <SortIcon field="leads" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button
                    onClick={() => handleSort('roas')}
                    className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors"
                  >
                    {STATIC_STRINGS.CAMPAIGN_FIELD_ROAS} <SortIcon field="roas" />
                  </button>
                </th>
                <th className="px-4 py-3 w-20 text-slate-500 font-semibold text-center">
                  {STATIC_STRINGS.TABLE_ACTIONS}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
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
                paginated.map((campaign, idx) => {
                  const isSelected = selectedIds.has(campaign.id);
                  const isCritical =
                    isDeadlineCritical(campaign.deadline) && campaign.status === 'active';

                  return (
                    <tr
                      key={campaign.id}
                      className={`border-b border-slate-50 last:border-0 transition-colors ${isSelected ? 'bg-violet-50/60' : idx % 2 === 0 ? 'hover:bg-slate-50/70' : 'bg-slate-50/20 hover:bg-slate-50/70'}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(campaign.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-violet-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600 truncate max-w-[120px]">
                        {campaign.client}
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() =>
                              setStatusDropdownId(
                                statusDropdownId === campaign.id ? null : campaign.id
                              )
                            }
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold transition-opacity hover:opacity-80 ${CAMPAIGN_STATUS_STYLES[campaign.status]}`}
                          >
                            {campaign.status}
                          </button>
                          {statusDropdownId === campaign.id && (
                            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1">
                              {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(campaign.id, s)}
                                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-slate-50 flex items-center gap-2 ${campaign.status === s ? 'font-bold text-violet-700' : 'text-slate-600'}`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-500' : s === 'paused' ? 'bg-orange-400' : 'bg-slate-300'}`}
                                  />
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${CAMPAIGN_STAGE_STYLES[campaign.stage]}`}
                        >
                          {campaign.stage}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
                            {campaign.assigneeInitials}
                          </div>
                          <span className="text-slate-600 truncate max-w-[80px]">
                            {campaign.assignee}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${PLATFORM_STYLES[campaign.platform]}`}
                        >
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`font-medium ${isCritical ? 'text-red-600' : 'text-slate-600'}`}
                        >
                          {campaign.deadline} {isCritical && '⚠'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700 font-mono">
                        {campaign.spend}
                      </td>
                     <td className="px-3 py-3 text-right tabular-nums text-slate-700 font-mono">
  {(campaign.leads ?? 0).toLocaleString()}
</td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`font-bold tabular-nums font-mono ${campaign.roas >= 4 ? 'text-emerald-600' : campaign.roas >= 2.5 ? 'text-slate-700' : 'text-red-500'}`}
                        >
                          {campaign.roas > 0 ? `${campaign.roas}×` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => setLogTarget(campaign)}
                            title={STATIC_STRINGS.CAMPAIGN_MGMT_LOG_PERFORMANCE}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <TrendingUp size={13} />
                          </button>
                          <button
                            onClick={() => setEditTarget(campaign)}
                            title={STATIC_STRINGS.CAMPAIGN_MGMT_EDIT}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(campaign)}
                            title={STATIC_STRINGS.CAMPAIGN_MGMT_DELETE}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          {user?.role === 'Owner' && (
                            <button
                              onClick={() => setHistoryTarget(campaign)}
                              title={STATIC_STRINGS.CAMPAIGN_MGMT_AUDIT_HISTORY}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <History size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          totalEntries={filtered.length}
          labels={{
            show: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_SHOW,
            of: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_OF,
            entries: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_ENTRIES,
          }}
        />
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-40 animate-slide-up">
          <span className="text-[13px] font-bold">
            {selectedIds.size} {STATIC_STRINGS.CAMPAIGN_MGMT_SELECTED}
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <button
            onClick={() => handleBulkAction('pause')}
            className="text-[12.5px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_MGMT_BULK_PAUSE}
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all"
          >
            {STATIC_STRINGS.CAMPAIGN_MGMT_BULK_DELETE}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      {editTarget && (
        <EditCampaignModal
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
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
