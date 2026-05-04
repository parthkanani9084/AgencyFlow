'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSuperAdminStore } from '@/store/superAdminStore';

import { mockService } from '@/services/mockService';
import { Building2, Plus, Mail, User, Trash2, Edit2, Search, Phone, Clock, CreditCard, X, BarChart3, Activity, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Agency } from '@/modules/super-admin/types';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

const ROLES_LIST = [ROLES.OWNER, ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] as const;

export default function BusinessAgencyView() {
  const { agencies, isLoading, refreshData, moduleUsage, roleWiseUsage } = useSuperAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgencyForDetail, setSelectedAgencyForDetail] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({ 
    id: '',
    name: '', 
    email: '', 
    ownerName: '', 
    mobileNumber: '', 
    subscription: STATIC_STRINGS.BA_SUB_FREE as string,
    status: 'active' as 'active' | 'inactive',
    expiryDate: '',
    startDate: ''
  });
  const [activeRoleTab, setActiveRoleTab] = useState<string>(ROLES.OWNER);

  // Mocked specific usage for detail view based on agency ID for consistency
  const agencyUsage = useMemo(() => {
    if (!selectedAgencyForDetail) return null;
    
    // Stable pseudo-random data based on agency ID
    const hash = selectedAgencyForDetail.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const views = 1200 + (hash % 5000);
    const actions = 150 + (hash % 800);
    
    // Sort modules to get top/low for this agency
    const sorted = [...moduleUsage].sort((a, b) => {
      const aVal = Object.values(a.roleData).reduce((s, r) => s + r.views, 0);
      const bVal = Object.values(b.roleData).reduce((s, r) => s + r.views, 0);
      return (hash % 2 === 0) ? bVal - aVal : aVal - bVal;
    });

    // Generate agency-specific role metrics
    const roleWiseData = ROLES_LIST.reduce((acc, role) => {
      const roleModules = roleWiseUsage[role] || [];
      acc[role] = roleModules.map(mod => ({
        ...mod,
        metrics: {
          views: Math.floor(mod.metrics.views * (0.5 + (hash % 10) / 10)),
          dataEntered: Math.floor(mod.metrics.dataEntered * (0.5 + (hash % 10) / 10)),
          updated: Math.floor(mod.metrics.updated * (0.5 + (hash % 10) / 10)),
          deleted: Math.floor(mod.metrics.deleted * (0.5 + (hash % 10) / 10)),
          currentRecords: Math.floor(mod.metrics.currentRecords * (0.5 + (hash % 10) / 10)),
          uniqueBase: Math.floor(mod.metrics.uniqueBase * (0.5 + (hash % 10) / 10)),
        }
      }));
      return acc;
    }, {} as Record<string, any>);

    return {
      views,
      actions,
      topModule: sorted[0]?.module || 'N/A',
      lowModule: sorted[sorted.length - 1]?.module || 'N/A',
      roleWiseData
    };
  }, [selectedAgencyForDetail, moduleUsage, roleWiseUsage]);

  const filteredAgencies = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return agencies;
    return agencies.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.ownerName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.mobileNumber.toLowerCase().includes(q)
    );
  }, [agencies, searchTerm]);

  const openAddModal = useCallback(() => {
    setIsEditing(false);
    setFormData({ 
      id: '', 
      name: '', 
      email: '', 
      ownerName: '', 
      mobileNumber: '', 
      subscription: STATIC_STRINGS.BA_SUB_FREE, 
      status: 'active', 
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((agency: Agency) => {
    setIsEditing(true);
    setFormData({ 
      id: agency.id,
      name: agency.name, 
      email: agency.email, 
      ownerName: agency.ownerName, 
      mobileNumber: agency.mobileNumber, 
      subscription: agency.subscription,
      status: agency.status,
      expiryDate: agency.expiryDate.split('T')[0],
      startDate: agency.startDate.split('T')[0]
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = isEditing 
      ? mockService.agency.update(formData.id, formData)
      : mockService.agency.add({ ...formData, lastActive: new Date().toISOString() });

    toast.promise(promise, {
      loading: isEditing ? STATIC_STRINGS.BA_TOAST_UPDATING : STATIC_STRINGS.BA_TOAST_ADDING,
      success: () => {
        setIsModalOpen(false);
        refreshData();
        return isEditing ? STATIC_STRINGS.BA_TOAST_UPDATED : STATIC_STRINGS.BA_TOAST_ADDED;
      },
      error: (err) => err.message || (isEditing ? 'Update failed' : 'Add failed')
    });
  };

  const toggleStatus = useCallback(async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await mockService.agency.update(id, { status: newStatus });
      toast.success(`${STATIC_STRINGS.BA_TOAST_STATUS_PREFIX} ${newStatus}`);
      refreshData();
    } catch (error: any) {
      toast.error(error.message || STATIC_STRINGS.FORM_SYSTEM_ERROR);
    }
  }, [refreshData]);

  const deleteAgency = useCallback(async (id: string) => {
    if (!confirm(STATIC_STRINGS.BA_CONFIRM_DELETE)) return;
    
    const promise = mockService.agency.delete(id);

    toast.promise(promise, {
      loading: STATIC_STRINGS.BA_TOAST_DELETING,
      success: () => {
        refreshData();
        return STATIC_STRINGS.BA_TOAST_DELETED;
      },
      error: (err) => err.message || STATIC_STRINGS.FORM_SYSTEM_ERROR
    });
  }, [refreshData]);

  return (
    <div className="p-6">
      <style>{scrollbarStyles}</style>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.BA_PAGE_TITLE}</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{STATIC_STRINGS.BA_PAGE_DESC}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} />
          {STATIC_STRINGS.BA_ADD_NEW}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={STATIC_STRINGS.BA_SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{STATIC_STRINGS.BA_COL_OWNER}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{STATIC_STRINGS.BA_COL_AGENCY}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">{STATIC_STRINGS.BA_COL_STATUS}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">{STATIC_STRINGS.BA_COL_SUBSCRIPTION}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">{STATIC_STRINGS.BA_COL_LAST_ACTIVE}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">{STATIC_STRINGS.BA_COL_ACTIONS}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm italic">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                      {STATIC_STRINGS.BA_LOADING}
                    </div>
                  </td>
                </tr>
              ) : filteredAgencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-sm italic font-medium">{STATIC_STRINGS.BA_NO_AGENCIES}</td>
                </tr>
              ) : (
                filteredAgencies.map((agency) => (
                  <tr 
                    key={agency.id} 
                    onClick={() => setSelectedAgencyForDetail(agency)}
                    className="hover:bg-violet-50/30 transition-all cursor-pointer group"
                  >

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                          <User size={12} className="text-slate-400" />
                          {agency.ownerName}
                        </p>
                        <p className="text-[12px] font-medium text-slate-500 flex items-center gap-2">
                          <Mail size={12} className="text-slate-400" />
                          {agency.email}
                        </p>
                        <p className="text-[12px] font-medium text-slate-500 flex items-center gap-2">
                          <Phone size={12} className="text-slate-400" />
                          {agency.mobileNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                   
                          <p className="text-[13.5px] font-bold text-slate-900 leading-tight transition-colors">{agency.name}</p>
                   </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(agency.id, agency.status);
                        }}
                        className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${
                          agency.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {agency.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                        agency.subscription === STATIC_STRINGS.BA_SUB_FREE 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-violet-50 text-violet-700 border-violet-100'
                      }`}>
                        <CreditCard size={12} />
                        <span className="text-[11px] font-bold">
                          {agency.subscription === STATIC_STRINGS.BA_SUB_FREE ? STATIC_STRINGS.BA_SUB_FREE : STATIC_STRINGS.BA_SUB_PREMIUM}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-[11px] font-semibold">
                          {new Date(agency.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(agency);
                          }}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAgency(agency.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agency Detail Modal */}
      {selectedAgencyForDetail && agencyUsage && (
        <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] relative">
            {/* Floating Close Button */}
            <button 
              onClick={() => setSelectedAgencyForDetail(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 transition-all z-[100]"
            >
              <X size={20} />
            </button>

            {/* Content: Scrollable */}
            <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex-1 relative">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{selectedAgencyForDetail.name}</h3>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Card 1: Module Views */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 transition-transform">
                      <BarChart3 size={20} />
                    </div>
                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50">{STATIC_STRINGS.BA_DETAIL_VIEWS}</div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{agencyUsage.views.toLocaleString()}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">{STATIC_STRINGS.BA_DETAIL_VIEWS_DESC}</p>
                </div>

                {/* Card 2: Data Actions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 transition-transform">
                      <Activity size={20} />
                    </div>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100/50">{STATIC_STRINGS.BA_DETAIL_ACTIONS}</div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{agencyUsage.actions.toLocaleString()}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">{STATIC_STRINGS.BA_DETAIL_ACTIONS_DESC}</p>
                </div>

                {/* Card 3: Top Module */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-violet-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 transition-transform">
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-[9px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50/50 px-2 py-0.5 rounded-md border border-violet-100/50">{STATIC_STRINGS.BA_DETAIL_BEST}</div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 leading-tight h-10 flex items-center">{agencyUsage.topModule}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">{STATIC_STRINGS.BA_DETAIL_TOP_MODULE}</p>
                </div>

                {/* Card 4: Low Module */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 transition-transform">
                      <TrendingUp size={20} className="rotate-180" />
                    </div>
                    <div className="text-[9px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50/50 px-2 py-0.5 rounded-md border border-orange-100/50">{STATIC_STRINGS.BA_DETAIL_LOW}</div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 leading-tight h-10 flex items-center">{agencyUsage.lowModule}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">{STATIC_STRINGS.BA_DETAIL_LOW_MODULE}</p>
                </div>
              </div>

              {/* Section 2: Business Snapshot */}
              <div className="mt-8 pt-8 border-t border-slate-200/60">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_SNAPSHOT}</h4>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Owner Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                        <User size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{STATIC_STRINGS.BA_DETAIL_OWNER_DETAIL}</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-900 truncate">{selectedAgencyForDetail.ownerName}</p>
                    <p className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">{selectedAgencyForDetail.email}</p>
                  </div>

                  {/* Subscription Plan */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${
                        selectedAgencyForDetail.subscription === 'Starter' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                      }`}>
                        <CreditCard size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{STATIC_STRINGS.BA_COL_SUBSCRIPTION}</span>
                    </div>
                    <p className={`text-[13px] font-bold ${
                      selectedAgencyForDetail.subscription === STATIC_STRINGS.BA_SUB_FREE ? 'text-blue-700' : 'text-violet-700'
                    }`}>
                      {selectedAgencyForDetail.subscription === STATIC_STRINGS.BA_SUB_FREE ? STATIC_STRINGS.BA_SUB_FREE : STATIC_STRINGS.BA_SUB_PREMIUM}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedAgencyForDetail.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        selectedAgencyForDetail.status === 'active' ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {selectedAgencyForDetail.status}
                      </span>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                        <Calendar size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{STATIC_STRINGS.BA_DETAIL_TIMELINE}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-600">{STATIC_STRINGS.BA_DETAIL_STARTED} <span className="text-slate-900">{new Date(selectedAgencyForDetail.startDate).toLocaleDateString()}</span></p>
                      <p className="text-[11px] font-bold text-slate-600">{STATIC_STRINGS.BA_DETAIL_EXPIRES} <span className="text-slate-900">{new Date(selectedAgencyForDetail.expiryDate).toLocaleDateString()}</span></p>
                    </div>
                    <p className="text-[10px] font-extrabold text-orange-700 mt-2 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-lg inline-block border border-orange-100 shadow-sm">
                      {Math.max(0, Math.ceil((new Date(selectedAgencyForDetail.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {STATIC_STRINGS.BA_DETAIL_DAYS_LEFT}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Role-Wise Module Activity */}
              <div className="mt-10 pt-8 border-t border-slate-200/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-violet-600 rounded-full" />
                  <h4 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_ROLE_ACTIVITY}</h4>
                </div>
                
                <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
                  {ROLES_LIST.map((role) => (
                    <button
                      key={role}
                      onClick={() => setActiveRoleTab(role)}
                      className={`flex-1 min-w-max px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        activeRoleTab === role 
                          ? 'bg-white text-violet-600 shadow-sm border border-slate-100' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_COL_MODULE}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_VIEWS}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_COL_ENTERED}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.ADS_TABLE_COL_STATUS}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.COMMON_REMOVE}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.CLIENT_MGMT_LABEL_REELS_PER_MONTH}</th>
                        <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.BA_DETAIL_COL_SCORE}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(agencyUsage.roleWiseData[activeRoleTab] || []).map((item: any) => (
                        <tr key={item.module} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-bold text-slate-800">{item.module}</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-slate-900">{item.metrics.views}</td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-emerald-600">{item.metrics.dataEntered}</td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-blue-600">{item.metrics.updated}</td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-red-500">{item.metrics.deleted}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                              {item.metrics.currentRecords}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-[13px] font-bold text-violet-600">{item.metrics.uniqueBase}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{isEditing ? STATIC_STRINGS.BA_EDIT_TITLE : STATIC_STRINGS.BA_ADD_NEW}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{STATIC_STRINGS.BA_EDIT_DESC}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{STATIC_STRINGS.BA_LABEL_NAME}</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder={STATIC_STRINGS.BA_PLACEHOLDER_NAME}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{STATIC_STRINGS.BA_LABEL_OWNER}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder={STATIC_STRINGS.BA_PLACEHOLDER_OWNER}
                      value={formData.ownerName}
                      onChange={e => setFormData({...formData, ownerName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{STATIC_STRINGS.BA_LABEL_EMAIL}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="email" 
                      placeholder={STATIC_STRINGS.BA_PLACEHOLDER_EMAIL}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      autoComplete="new-email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{STATIC_STRINGS.BA_LABEL_MOBILE}</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="tel" 
                      placeholder={STATIC_STRINGS.BA_PLACEHOLDER_MOBILE}
                      value={formData.mobileNumber}
                      onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
              </div>


              <div className="pt-6 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {STATIC_STRINGS.FORM_CANCEL}
                </button>
                <button 
                  type="submit"
                  className="px-10 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95"
                >
                  {isEditing ? STATIC_STRINGS.FORM_SAVE_CHANGES : STATIC_STRINGS.BA_CREATE_BTN}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
