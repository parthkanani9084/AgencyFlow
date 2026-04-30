'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, Eye, X, CheckSquare, Download, Megaphone, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import CreateCampaignModal from './CreateCampaignModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditCampaignModal from './EditCampaignModal';
import LogPerformanceModal from './LogPerformanceModal';
import CampaignHistoryModal from './CampaignHistoryModal';
import { History } from 'lucide-react';


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

const allCampaigns: Campaign[] = [
  { id: 'camp-001', name: 'Spring Collection Launch', client: 'Luma Apparel', status: 'active', stage: 'publish', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '04/18/2026', spend: '$8,420', budget: '$12,000', leads: 624, roas: 5.8, platform: 'Meta', createdAt: '03/01/2026' },
  { id: 'camp-002', name: 'Q2 Lead Generation Drive', client: 'Nexus Capital', status: 'active', stage: 'publish', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '04/30/2026', spend: '$12,100', budget: '$18,000', leads: 891, roas: 4.9, platform: 'Google', createdAt: '03/05/2026' },
  { id: 'camp-003', name: 'Product Reveal Reel', client: 'Orion Fitness', status: 'active', stage: 'process', assignee: 'Jin Park', assigneeInitials: 'JP', deadline: '04/12/2026', spend: '$3,200', budget: '$7,500', leads: 210, roas: 3.1, platform: 'TikTok', createdAt: '03/10/2026' },
  { id: 'camp-004', name: 'B2B Awareness Push', client: 'Synapse Tech', status: 'active', stage: 'publish', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '04/25/2026', spend: '$6,750', budget: '$10,000', leads: 178, roas: 4.2, platform: 'LinkedIn', createdAt: '03/12/2026' },
  { id: 'camp-005', name: 'Summer Sale Blitz', client: 'Coral Beauty', status: 'active', stage: 'process', assignee: 'Marco Reyes', assigneeInitials: 'MR', deadline: '04/10/2026', spend: '$1,800', budget: '$9,000', leads: 94, roas: 2.4, platform: 'Meta', createdAt: '03/20/2026' },
  { id: 'camp-006', name: 'Reactivation Campaign', client: 'Pulse Nutrition', status: 'active', stage: 'in review', assignee: 'Priya Sharma', assigneeInitials: 'PS', deadline: '04/11/2026', spend: '$4,500', budget: '$6,000', leads: 312, roas: 3.9, platform: 'Meta', createdAt: '02/28/2026' },
  { id: 'camp-007', name: 'Brand Awareness Wave', client: 'Helios Solar', status: 'paused', stage: 'process', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '04/22/2026', spend: '$2,100', budget: '$8,500', leads: 67, roas: 1.8, platform: 'Google', createdAt: '03/15/2026' },
  { id: 'camp-008', name: 'Influencer Collab Push', client: 'Bloom Skincare', status: 'active', stage: 'process', assignee: 'Jin Park', assigneeInitials: 'JP', deadline: '04/14/2026', spend: '$5,600', budget: '$11,000', leads: 445, roas: 4.1, platform: 'TikTok', createdAt: '03/18/2026' },
  { id: 'camp-009', name: 'Retargeting Funnel Q2', client: 'Nexus Capital', status: 'active', stage: 'publish', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '05/05/2026', spend: '$7,300', budget: '$14,000', leads: 534, roas: 4.6, platform: 'Multi', createdAt: '03/22/2026' },
  { id: 'camp-010', name: 'Gym Membership Drive', client: 'Orion Fitness', status: 'draft', stage: 'in draft', assignee: 'Priya Sharma', assigneeInitials: 'PS', deadline: '04/28/2026', spend: '$0', budget: '$6,000', leads: 0, roas: 0, platform: 'Meta', createdAt: '04/01/2026' },
  { id: 'camp-011', name: 'End-of-Season Clearance', client: 'Luma Apparel', status: 'completed', stage: 'publish', assignee: 'Sofia Nguyen', assigneeInitials: 'SN', deadline: '03/31/2026', spend: '$9,800', budget: '$10,000', leads: 728, roas: 5.2, platform: 'Meta', createdAt: '02/15/2026' },
  { id: 'camp-012', name: 'Tech Event Sponsorship', client: 'Synapse Tech', status: 'active', stage: 'process', assignee: 'Marco Reyes', assigneeInitials: 'MR', deadline: '04/16/2026', spend: '$2,400', budget: '$7,000', leads: 88, roas: 2.1, platform: 'LinkedIn', createdAt: '03/28/2026' },
];

const statusOptions: CampaignStatus[] = ['active', 'draft', 'paused', 'completed', 'archived'];
const stageOptions: WorkflowStage[] = ['in draft', 'in review', 'process', 'publish'];
const platformOptions: Platform[] = ['Meta', 'Facebook', 'Instagram', 'Google', 'TikTok', 'LinkedIn', 'Multi'];
const clientOptions = [...new Set(allCampaigns.map((c) => c.client))].sort();

const statusBadge: Record<CampaignStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  paused: 'bg-orange-50 text-orange-700 border border-orange-200',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  archived: 'bg-slate-100 text-slate-400 border border-slate-200',
};

const stageBadge: Record<WorkflowStage, string> = {
  'in draft': 'bg-slate-100 text-slate-600',
  'in review': 'bg-sky-50 text-sky-700',
  'process': 'bg-violet-50 text-violet-700',
  'publish': 'bg-emerald-50 text-emerald-700',
};

const platformBadge: Record<Platform, string> = {
  Meta: 'bg-blue-50 text-blue-700',
  Facebook: 'bg-blue-50 text-blue-700',
  Instagram: 'bg-pink-50 text-pink-700 px-2.5',
  Google: 'bg-red-50 text-red-600',
  TikTok: 'bg-slate-800 text-white',
  LinkedIn: 'bg-sky-50 text-sky-700',
  Multi: 'bg-violet-50 text-violet-700',
};

type SortField = 'name' | 'client' | 'deadline' | 'leads' | 'roas' | 'spend';
type SortDir = 'asc' | 'desc';

export default function CampaignTable() {
  const { user } = useAuth();
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [logTarget, setLogTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(allCampaigns);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agencyflow_campaigns');
      if (saved) {
        setCampaigns(JSON.parse(saved));
      }
    }
  }, []);

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem('agencyflow_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = campaigns;

    // RBAC: Filter campaigns based on user role
    // Owners, Managers and Social Media Managers see all campaigns. Others see only assigned campaigns.
    if (user && user.role !== 'Owner' && user.role !== 'Manager' && user.role !== 'Social Media Manager') {
      data = data.filter((c) => c.assignee === user.name);
    }

    if (search) data = data.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) data = data.filter((c) => c.status === statusFilter);
    if (clientFilter) data = data.filter((c) => c.client === clientFilter);
    if (stageFilter) data = data.filter((c) => c.stage === stageFilter);
    if (platformFilter) data = data.filter((c) => c.platform === platformFilter);

    data = [...data].sort((a, b) => {
      let av: string | number = a[sortField] as string | number;
      let bv: string | number = b[sortField] as string | number;
      if (typeof av === 'string') av = av.replace(/[$,×]/g, '');
      if (typeof bv === 'string') bv = bv.replace(/[$,×]/g, '');
      const cmp = Number(av) < Number(bv) ? -1 : Number(av) > Number(bv) ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [campaigns, user, search, statusFilter, clientFilter, stageFilter, platformFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-violet-600" /> : <ChevronDown size={12} className="text-violet-600" />;
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

  const handleBulkDelete = () => {
    setCampaigns((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    toast.success(`${selectedIds.size} campaign${selectedIds.size > 1 ? 's' : ''} deleted`);
    setSelectedIds(new Set());
  };

  const handleDelete = (campaign: Campaign) => {
    setDeleteTarget(campaign);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  };

  const handleStatusChange = (campaignId: string, newStatus: CampaignStatus) => {
    setCampaigns((prev) => prev.map((c) => c.id === campaignId ? { ...c, status: newStatus } : c));
    setStatusDropdownId(null);
    toast.success('Campaign status updated');
    // BACKEND INTEGRATION: PATCH /api/campaigns/:id { status: newStatus }
  };

  const handleCreateSuccess = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
    setCreateOpen(false);
    toast.success(`Campaign "${newCampaign.name}" created and workflow initiated`);
  };

  const handleEditSuccess = (updated: Campaign) => {
    setCampaigns((prev) => prev.map(c => c.id === updated.id ? updated : c));
    setEditTarget(null);
    toast.success(`Campaign "${updated.name}" updated successfully`);
  };

  const handleLogSuccess = (updated: Campaign) => {
    setCampaigns((prev) => prev.map(c => c.id === updated.id ? updated : c));
    setLogTarget(null);
    toast.success(`Performance logged for "${updated.name}"`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setClientFilter('');
    setStageFilter('');
    setPlatformFilter('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || clientFilter || stageFilter || platformFilter;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Campaign Management</h1>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                {filtered.length} campaign{filtered.length !== 1 ? 's' : ''} · {campaigns.filter((c) => c.status === 'active').length} active
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[12.5px] font-medium transition-colors">
                <Download size={13} />
                Export
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[12.5px] font-semibold transition-all duration-150"
              >
                <Plus size={13} />
                New Campaign
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns or clients…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder-slate-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as CampaignStatus | ''); setPage(1); }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 outline-none text-slate-600 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={`status-opt-${s}`} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <select
              value={clientFilter}
              onChange={(e) => { setClientFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 outline-none text-slate-600 cursor-pointer"
            >
              <option value="">All Clients</option>
              {clientOptions.map((c) => (
                <option key={`client-opt-${c}`} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value as WorkflowStage | ''); setPage(1); }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 outline-none text-slate-600 cursor-pointer"
            >
              <option value="">All Stages</option>
              {stageOptions.map((s) => (
                <option key={`stage-opt-${s}`} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={platformFilter}
              onChange={(e) => { setPlatformFilter(e.target.value as Platform | ''); setPage(1); }}
              className="px-3 py-2 text-[12.5px] border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-violet-400 outline-none text-slate-600 cursor-pointer"
            >
              <option value="">All Platforms</option>
              {platformOptions.map((p) => (
                <option key={`platform-opt-${p}`} value={p}>{p}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-[12px] text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
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
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                    Campaign <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  <button onClick={() => handleSort('client')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                    Client <SortIcon field="client" />
                  </button>
                </th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">Status</th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">Stage</th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">Assignee</th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">Platform</th>
                <th className="text-left px-3 py-3 text-slate-500 font-semibold">
                  <button onClick={() => handleSort('deadline')} className="flex items-center gap-1 hover:text-slate-700 transition-colors">
                    Deadline <SortIcon field="deadline" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button onClick={() => handleSort('spend')} className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors">
                    Spend <SortIcon field="spend" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button onClick={() => handleSort('leads')} className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors">
                    Leads <SortIcon field="leads" />
                  </button>
                </th>
                <th className="text-right px-3 py-3 text-slate-500 font-semibold">
                  <button onClick={() => handleSort('roas')} className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors">
                    ROAS <SortIcon field="roas" />
                  </button>
                </th>

                <th className="px-4 py-3 w-20 text-slate-500 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Megaphone size={22} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-slate-600">No campaigns found</p>
                        <p className="text-[12.5px] text-slate-400 mt-1">
                          {hasFilters ? 'Try adjusting your filters or search query.' : 'Create your first campaign to start automating your workflow.'}
                        </p>
                      </div>
                      {!hasFilters && (
                        <button
                          onClick={() => setCreateOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors mt-1"
                        >
                          <Plus size={14} /> Create Campaign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((campaign, idx) => {
                  const isSelected = selectedIds.has(campaign.id);
                  const isDeadlineNear = (() => {
                    const d = new Date(campaign.deadline);
                    const now = new Date('2026-04-09');
                    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 3;
                  })();

                  return (
                    <tr
                      key={campaign.id}
                      className={`border-b border-slate-50 last:border-0 transition-colors ${
                        isSelected ? 'bg-violet-50/60' : idx % 2 === 0 ? 'hover:bg-slate-50/70' : 'bg-slate-50/20 hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(campaign.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-violet-600 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-3 max-w-[180px]">
                        <p className="font-semibold text-slate-800 truncate">{campaign.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{campaign.id}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{campaign.client}</td>
                      <td className="px-3 py-3">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setStatusDropdownId(statusDropdownId === campaign.id ? null : campaign.id)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold cursor-pointer hover:opacity-80 transition-opacity ${statusBadge[campaign.status]}`}
                          >
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </button>
                          {statusDropdownId === campaign.id && (
                            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 animate-scale-in">
                              {statusOptions.map((s) => (
                                <button
                                  key={`status-change-${campaign.id}-${s}`}
                                  onClick={() => handleStatusChange(campaign.id, s)}
                                  className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                                    campaign.status === s ? 'font-semibold text-violet-700' : 'text-slate-600'
                                  }`}
                                >
                                  <span className={`inline-flex w-2 h-2 rounded-full ${
                                    s === 'active' ? 'bg-emerald-500' :
                                    s === 'paused' ? 'bg-orange-400' :
                                    s === 'completed' ? 'bg-blue-500' :
                                    s === 'draft' ? 'bg-slate-300' : 'bg-slate-200'
                                  }`} />
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${stageBadge[campaign.stage]}`}>
                          {campaign.stage}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-white">{campaign.assigneeInitials}</span>
                          </div>
                          <span className="text-slate-600 whitespace-nowrap truncate max-w-[90px]">{campaign.assignee}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${platformBadge[campaign.platform]}`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`font-medium whitespace-nowrap ${isDeadlineNear && campaign.status === 'active' ? 'text-red-600' : 'text-slate-600'}`}>
                          {campaign.deadline}
                          {isDeadlineNear && campaign.status === 'active' && (
                            <span className="ml-1 text-[10px] text-red-500 font-semibold">⚠</span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">{campaign.spend}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">{campaign.leads.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={`font-bold font-mono tabular-nums ${
                          campaign.roas >= 4 ? 'text-emerald-600' :
                          campaign.roas >= 2.5 ? 'text-slate-700' :
                          campaign.roas === 0 ? 'text-slate-400' : 'text-red-500'
                        }`}>
                          {campaign.roas > 0 ? `${campaign.roas}×` : '—'}
                        </span>
                      </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              title="Log performance metrics"
                              onClick={() => setLogTarget(campaign)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <TrendingUp size={13} />
                            </button>
                            <button
                              title="Edit campaign"
                              onClick={() => setEditTarget(campaign)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              title="Delete campaign — this cannot be undone"
                              onClick={() => handleDelete(campaign)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                            {user?.role === 'Owner' && (
                              <button
                                title="View edit history"
                                onClick={() => setHistoryTarget(campaign)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-[12px] text-slate-600 outline-none focus:border-violet-400"
            >
              {[6, 8, 12, 20].map((n) => (
                <option key={`perpage-${n}`} value={n}>{n}</option>
              ))}
            </select>
            <span>of <strong className="text-slate-700">{filtered.length}</strong> campaigns</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded-lg text-[12px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg text-[12px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setPage(pageNum)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                    page === pageNum ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-2.5 py-1 rounded-lg text-[12px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              className="px-2 py-1 rounded-lg text-[12px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-40 animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckSquare size={15} className="text-violet-400" />
            <span className="text-[13px] font-semibold">{selectedIds.size} selected</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <button
            onClick={() => { setCampaigns((prev) => prev.map((c) => selectedIds.has(c.id) ? { ...c, status: 'paused' } : c)); toast.success(`${selectedIds.size} campaigns paused`); setSelectedIds(new Set()); }}
            className="text-[12.5px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            Pause
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-[12.5px] font-semibold transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X size={14} className="text-slate-400" />
          </button>
        </div>
      )}

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditCampaignModal
        open={!!editTarget}
        campaign={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />

      <LogPerformanceModal
        open={!!logTarget}
        campaign={logTarget}
        onClose={() => setLogTarget(null)}
        onSuccess={handleLogSuccess}
      />

      <CampaignHistoryModal
        open={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        campaign={historyTarget as any}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        campaignName={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}