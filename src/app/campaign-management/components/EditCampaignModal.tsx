'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import {
  STATIC_STRINGS,
  PLATFORM_OPTIONS,
  OBJECTIVE_OPTIONS,
} from '@/utils/constants';
import { Loader2 } from 'lucide-react';
import { useUpdateCampaign } from '@/api/hooks/useCampaign';
import { useGetTeamsByRole } from '@/api/hooks/useTeam';
import { useClients } from '@/api/hooks/useClient';

interface CampaignFormValues {
  name: string;
  client: string;
  platforms: string[];
  objective: string;
  dailyBudget: string;
  location: string;
  targetAudience: string;
  photoVideoLocation: string;
  note: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  stage: string;
  assignee: string;
  deadline: string;
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
    setValue,
    control,
    formState: { errors, dirtyFields },
  } = useForm<CampaignFormValues>({
    defaultValues: {
      name: '',
      client: '',
      platforms: [],
      objective: '',
      dailyBudget: '',
      location: '',
      targetAudience: '',
      photoVideoLocation: '',
      note: '',
      priority: 'medium',
      status: 'draft',
      stage: 'in draft',
      assignee: '',
      deadline: '',
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

    const rawStatus = (campaign.status || 'draft').toLowerCase();
    const statusValue = rawStatus === 'pause' ? 'paused' : rawStatus;

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
      objective: campaign.objective || '',
      dailyBudget: String(campaign.budget || '').replace(/[^0-9.]/g, ''),
      location: campaign.location || '',
      targetAudience: campaign.targetAudience || '',
      photoVideoLocation: campaign.mediaLocation || '',
      note: campaign.notes || '',
      priority: (campaign.priority as 'low' | 'medium' | 'high') || 'medium',
      status: statusValue,
      stage: stageValue,
      assignee: campaign.assigneeId || '',
      deadline: initialDate || '',
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
      if (dirtyFields.objective) payload.objective = data.objective;
      if (dirtyFields.dailyBudget) payload.daily_budget = Number(data.dailyBudget);
      if (dirtyFields.location) payload.campaign_run_location = data.location;
      if (dirtyFields.targetAudience) payload.target_audience = data.targetAudience;
      if (dirtyFields.photoVideoLocation) payload.media_location = data.photoVideoLocation;
      if (dirtyFields.note) payload.notes = data.note;
      if (dirtyFields.priority) payload.priority_level = data.priority;
      if (dirtyFields.status) {
        payload.status = data.status === 'paused' ? 'pause' : data.status;
      }
      if (dirtyFields.stage) payload.stage = data.stage.replace(/ /g, '-');
      if (dirtyFields.deadline) payload.deadline_date = data.deadline;

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      const response = await updateCampaign({ campaignId: campaign.id, payload });
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        {/* Scrollable fields area */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[65vh]">

          {/* Row 1: Campaign Name & Client */}
          <div className="grid grid-cols-2 gap-5">
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

          {/* Row 2: Objective & Daily Budget */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_OBJECTIVE}
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                {...register('objective')}
                disabled={!isOwnerOrManager}
              >
                <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_OBJECTIVE}</option>
                {OBJECTIVE_OPTIONS.map((o) => (
                  <option key={`obj-${o}`} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_BUDGET}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
                  {STATIC_STRINGS.CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_BUDGET}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  {...register('dailyBudget')}
                  disabled={!isOwnerOrManager}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Status & Stage */}
          <div className="grid grid-cols-2 gap-5">
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

          {/* Row 4: Deadline & Assignee */}
          <div className="grid grid-cols-2 gap-5">
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

          {/* Row 5: Location & Target Audience */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_LOCATION}
              </label>
              <input
                type="text"
                placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_LOCATION}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                {...register('location')}
                disabled={!isOwnerOrManager}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_AUDIENCE}
              </label>
              <input
                type="text"
                placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_AUDIENCE}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                {...register('targetAudience')}
                disabled={!isOwnerOrManager}
              />
            </div>
          </div>

          {/* Row 6: Photo/Video Location & Priority */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_MEDIA_LOCATION}
              </label>
              <input
                type="text"
                placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_MEDIA_LOCATION}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                {...register('photoVideoLocation')}
                disabled={!isOwnerOrManager}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.CREATE_CAMPAIGN_PRIORITY}
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 transition-all"
                {...register('priority')}
                disabled={!isOwnerOrManager}
              >
                <option value="low">{STATIC_STRINGS.PRIORITY_LOW}</option>
                <option value="medium">{STATIC_STRINGS.PRIORITY_MEDIUM}</option>
                <option value="high">{STATIC_STRINGS.PRIORITY_HIGH}</option>
              </select>
            </div>
          </div>

          {/* Row 7: Ad Platform (Full Width) */}
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
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PLATFORM_OPTIONS.filter((p) => p !== STATIC_STRINGS.MULTI_PLATFORM).map((p) => {
                      const isChecked = field.value?.includes(p);
                      return (
                        <label
                          key={`edit-plat-${p}`}
                          className="flex items-center gap-2 cursor-pointer group"
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

          {/* Row 8: Note (Full Width) */}
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.CREATE_CAMPAIGN_NOTE}
            </label>
            <textarea
              rows={2}
              placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_NOTE}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
              {...register('note')}
              disabled={!isOwnerOrManager}
            />
          </div>

        </div>

        {/* Footer — always visible, outside scroll area */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
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
