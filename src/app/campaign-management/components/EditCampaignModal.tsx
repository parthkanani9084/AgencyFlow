'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { auditService } from '@/lib/services/auditService';
import { STATIC_STRINGS, CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_STAGE_OPTIONS, PLATFORM_OPTIONS, TEAM_MEMBERS } from '@/utils/constants';
import { Loader2 } from 'lucide-react';
import { useUpdateCampaign } from '@/api/hooks/useCampaign';
import { useGetTeamsByRole } from '@/api/hooks/useTeam';
import { useClients } from '@/api/hooks/useClient';

interface CampaignFormValues {
  name: string;
  client: string;
  platforms: string[];
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

export default function EditCampaignModal({ open, onClose, campaign, onSuccess }: Props) {
  const { user } = useAuth();
  const isOwnerOrManager = user?.role === 'Owner' || user?.role === 'Manager';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateCampaign } = useUpdateCampaign();

  const { data: clientsData, isLoading: isFetchingClients } = useClients(
    { page: 1, limit: 100 },
    { enabled: open }
  );
  const [clientsList, setClientsList] = useState<{ id: string; name: string }[]>([]);

  const role = STATIC_STRINGS.CAMPAIGN_ADSMANAGER_ROLE;
  const { data: teamData } = useGetTeamsByRole(role, { enabled: open });
  const [adManagers, setAdManagers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    if ((clientsData as any)?.results?.data) {
      setClientsList(
        (clientsData as any).results.data.map((c: any) => ({
          id: c.id,
          name: c.clientName,
        }))
      );
    }
  }, [clientsData]);


  useEffect(() => {
    if (teamData) {
      const results = (teamData as any)?.results || [];
      const mapped = results.map((m: any) => ({
        id: String(m.id),
        full_name: String(m.full_name),
      }));
      setAdManagers(mapped);
    }
  }, [teamData]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, dirtyFields },
  } = useForm<CampaignFormValues>({
    defaultValues: {
      name: '',
      client: '',
      platforms: [],
      status: 'draft',
      stage: 'in draft',
      assignee: '',
      deadline: '',
      spend: '',
      leads: 0,
      roas: 0,
      budget: '',
    },
  });

  useEffect(() => {
    if (!campaign) return;

    let initialDate = campaign.deadline;
    if (initialDate && initialDate.includes('/')) {
      const [m, d, y] = initialDate.split('/');
      const fullYear = y.length === 2 ? `20${y}` : y;
      initialDate = `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const stageValue = campaign.stage || 'in draft';

    // --- Status normalization ---
    // API stores 'pause' but our dropdown uses 'paused'
    const rawStatus = (campaign.status || 'draft').toLowerCase();
    const statusValue = rawStatus === 'pause' ? 'paused' : rawStatus;

    // --- Platform normalization ---
    const rawPlatforms = Array.isArray(campaign.platforms) ? campaign.platforms : [];
    const platformValues = rawPlatforms
      .map((p: string) =>
        PLATFORM_OPTIONS.find((opt) => opt.toLowerCase() === p.toLowerCase()) || p
      )
      .filter(Boolean) as string[];

    reset({
      name: campaign.name || '',
      client: campaign.clientId || '',
      platforms: platformValues,
      status: statusValue,
      stage: stageValue,
      assignee: campaign.assigneeId || '',
      deadline: initialDate || '',
      spend: String(campaign.spend || '').replace(/[^0-9.]/g, ''),
      leads: campaign.leads || 0,
      roas: campaign.roas || 0,
      budget: String(campaign.budget || '').replace(/[^0-9.]/g, ''),
    });

    setValue('status', statusValue);
    setValue('stage', stageValue);
    setValue('platforms', platformValues);
  }, [campaign, reset]);

  useEffect(() => {
    if (campaign?.clientId && clientsList.length > 0) {
      setValue('client', campaign.clientId);
    }
  }, [clientsList, campaign?.clientId, setValue]);

  useEffect(() => {
    if (campaign?.assigneeId && adManagers.length > 0) {
      setValue('assignee', campaign.assigneeId);
    }
  }, [adManagers, campaign?.assigneeId, setValue]);

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);

    try {
      const payload: any = {};

      if (dirtyFields.name) payload.campaign_name = data.name;
      if (dirtyFields.client) payload.client_id = data.client;
      if (dirtyFields.assignee) payload.assigned_to = data.assignee;
      if (dirtyFields.platforms) payload.ads_platform = data.platforms;
      if (dirtyFields.status) {
        payload.status = data.status === 'paused' ? 'pause' : data.status;
      }
      if (dirtyFields.stage) payload.stage = data.stage.replace(/ /g, '-');
      if (dirtyFields.deadline) payload.deadline_date = data.deadline;
      if (dirtyFields.budget) payload.daily_budget = Number(data.budget);

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      const response = await updateCampaign({
        campaignId: campaign.id,
        payload,
      });

      if (response.success) {
        onSuccess(response.results);
      }
    } catch (error) {
      console.error('Failed to update campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={STATIC_STRINGS.EDIT_MODAL_TITLE}
      subtitle={`${STATIC_STRINGS.EDIT_MODAL_SUBTITLE} ${campaign?.name}`}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_NAME}
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-semibold disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('name', { required: true })}
              disabled={!isOwnerOrManager}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT}
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('client')}
              disabled={!isOwnerOrManager}
            >
              <option value="">
                {isFetchingClients ? 'Loading clients...' : 'Select Client'}
              </option>
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Workflow & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_STATUS}
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('status')}
              disabled={!isOwnerOrManager}
            >
              <option value="" disabled>Select Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_STAGE}
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('stage')}
              disabled={!isOwnerOrManager}
            >
              <option value="" disabled>Select Stage</option>
              <option value="in draft">In Draft</option>
              <option value="in review">In Review</option>
              <option value="process">Process</option>
              <option value="publish">Publish</option>
            </select>
          </div>
        </div>

        {/* Row 3: Deadline & Assignee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_DEADLINE}
            </label>
            <input
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('deadline', { required: true })}
              disabled={!isOwnerOrManager}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CAMPAIGN_FIELD_ASSIGNEE}
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
              {...register('assignee')}
              disabled={!isOwnerOrManager}
            >
              <option value="">Select Assignee</option>
              {adManagers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Platform (Full Width) */}
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">
            {STATIC_STRINGS.CAMPAIGN_FIELD_PLATFORM}
          </label>
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <Controller
              name="platforms"
              control={control}
              rules={{
                validate: (val) =>
                  (val && val.length > 0) || STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_PLATFORM,
              }}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {PLATFORM_OPTIONS.filter((p) => p !== STATIC_STRINGS.MULTI_PLATFORM).map((p) => {
                    const isChecked = field.value?.includes(p);
                    return (
                      <label
                        key={`edit-plat-${p}`}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const newValue = isChecked
                              ? field.value.filter((v: string) => v !== p)
                              : [...(field.value || []), p];
                            field.onChange(newValue);
                          }}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500/20 border-slate-300 transition-all cursor-pointer"
                          disabled={!isOwnerOrManager}
                        />
                        <span className="text-[12.5px] text-slate-600 group-hover:text-violet-700 transition-colors whitespace-nowrap">
                          {p}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.platforms && (
              <p className="mt-2 text-[11px] text-red-600 font-medium tracking-tight">
                {errors.platforms.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Financials & Metrics */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            {STATIC_STRINGS.EDIT_MODAL_FINANCIALS}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1">
                {STATIC_STRINGS.CAMPAIGN_FIELD_BUDGET}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('budget')}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1">
                {STATIC_STRINGS.EDIT_MODAL_ACTUAL_SPEND}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('spend')}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1">
                {STATIC_STRINGS.CAMPAIGN_FIELD_LEADS}
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none"
                {...register('leads')}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1">
                {STATIC_STRINGS.CAMPAIGN_FIELD_ROAS}
              </label>
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {STATIC_STRINGS.FORM_CANCEL}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[13px] font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? STATIC_STRINGS.EDIT_MODAL_SAVING : STATIC_STRINGS.EDIT_MODAL_SAVE}
          </button>
        </div>
      </form>
    </Modal>
  );
}
