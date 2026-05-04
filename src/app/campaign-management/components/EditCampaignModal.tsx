'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { auditService } from '@/lib/services/auditService';

interface CampaignFormValues {
  name: string;
  client: string;
  platform: string;
  status: string;
  stage: string;
  assignee: string;
  deadline: string;
  spend: string;
  leads: number;
  roas: number;
  budget: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  campaign: any;
  onSuccess: (updatedCampaign: any) => void;
}

const statusOptions = ['active', 'draft', 'paused', 'completed', 'archived'];
const stageOptions = ['in draft', 'in review', 'process', 'publish'];
const platformOptions = ['Meta', 'Facebook', 'Instagram', 'Google', 'TikTok', 'LinkedIn', 'Multi'];
const teamMembers = [
  { id: 'user-001', name: 'Marco Reyes', initials: 'MR' },
  { id: 'user-002', name: 'Jin Park', initials: 'JP' },
  { id: 'user-003', name: 'Sofia Nguyen', initials: 'SN' },
  { id: 'user-004', name: 'Priya Sharma', initials: 'PS' },
];

export default function EditCampaignModal({ open, onClose, campaign, onSuccess }: Props) {
  const { user } = useAuth();
  const isOwnerOrManager = user?.role === 'Owner' || user?.role === 'Manager';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>();


  useEffect(() => {
    if (campaign) {
      // Transform MM/DD/YYYY to YYYY-MM-DD for the native date input
      let initialDate = campaign.deadline;
      if (initialDate && initialDate.includes('/')) {
        const [m, d, y] = initialDate.split('/');
        initialDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      // Normalize Stage mapping (handle legacy values)
      let currentStage = campaign.stage || 'in draft';
      const stageMap: Record<string, string> = {
        'Briefing': 'in draft',
        'Shooting': 'process',
        'Editing': 'process',
        'Ads Setup': 'process',
        'Ads Live': 'publish',
        'Review': 'in review',
        'Completed': 'publish'
      };
      
      if (stageMap[currentStage]) {
        currentStage = stageMap[currentStage];
      }
      
      // Ensure values are lowercase to match dropdown options
      const normalizedStatus = (campaign.status || 'draft').toLowerCase();
      const normalizedStage = currentStage.toLowerCase();
      const normalizedPlatform = (campaign.platform || 'Meta');

      reset({
        name: campaign.name,
        client: campaign.client,
        platform: normalizedPlatform,
        status: normalizedStatus,
        stage: normalizedStage,
        assignee: campaign.assignee,
        deadline: initialDate,
        spend: campaign.spend,
        leads: campaign.leads,
        roas: campaign.roas,
        budget: campaign.budget,
      });
    }
  }, [campaign, reset]);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    // Transform YYYY-MM-DD back to MM/DD/YYYY for table display consistency
    let savedDate = data.deadline;
    if (savedDate && savedDate.includes('-')) {
      const [y, m, d] = savedDate.split('-');
      savedDate = `${m}/${d}/${y}`;
    }

    const selectedMember = teamMembers.find(m => m.name === data.assignee);
    const updatedData = {
      ...campaign,
      ...data,
      deadline: savedDate,
      leads: Number(data.leads),
      roas: Number(data.roas),
      assigneeInitials: selectedMember?.initials || 'UN'
    };

    // Atomic update with audit logging
    const finalCampaign = auditService.performAtomicUpdate(campaign, updatedData, user as any);

    setIsSubmitting(false);
    onSuccess(finalCampaign);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Campaign Details"
      subtitle={`Manage all fields for ${campaign?.name}`}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

        {/* Row 1: Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign Name</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-semibold disabled:bg-slate-50 disabled:text-slate-500"
              {...register('name', { required: true })}
              disabled={!isOwnerOrManager}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client</label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 disabled:bg-slate-50 disabled:text-slate-500"
              {...register('client')}
              disabled={!isOwnerOrManager}
            />
          </div>
        </div>

        {/* Row 2: Workflow & Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              {...register('status')}
              disabled={!isOwnerOrManager}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Stage</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              {...register('stage')}
              disabled={!isOwnerOrManager}
            >
              {stageOptions.map((s) => (
                <option key={s} value={s}>
                  {s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Platform</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              {...register('platform')}
              disabled={!isOwnerOrManager}
            >
              {platformOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Deadline</label>
            <input
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              {...register('deadline', { required: true })}
              disabled={!isOwnerOrManager}
            />
          </div>
        </div>

        {/* Row 3: Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Assignee</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              {...register('assignee')}
              disabled={!isOwnerOrManager}
            >
              {teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: Financials & Metrics */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Financials & Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">Budget</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('budget')}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">Actual Spend</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('spend')}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">Leads</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('leads')}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">ROAS</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('roas')}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
