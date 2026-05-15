'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Label from '@/components/ui/Label';
import { STATIC_STRINGS, OBJECTIVE_OPTIONS, PLATFORM_OPTIONS } from '@/utils/constants';
import { LoaderCircle } from 'lucide-react';
import { CreateCampaignPayload } from '@/api/services/campaign.service';
import { useCreateCampaign } from '@/api/hooks/useCampaign';
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
  adsAssignee: string;
  note: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (campaign: any) => void;
}

export default function CreateCampaignModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientsList, setClientsList] = useState<{ id: string; name: string }[]>([]);
  const [adManagers, setAdManagers] = useState<{ id: string; full_name: string }[]>([]);


  // For fetching ad managers based on role
  const role = STATIC_STRINGS.CAMPAIGN_ADSMANAGER_ROLE;
  const { data: teamData, isLoading: isFetchingTeams, error } = useGetTeamsByRole(role, { enabled: open });

  const { data: clientsData, isLoading: isFetchingClients } = useClients(
    { page: 1, limit: 100 },
    { enabled: open }
  );

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

    if (error) {
      setAdManagers([]);
    }
  }, [teamData, error]);

  // Adjust if your API returns a different structure
  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
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
      adsAssignee: '',
      note: '',
      deadline: '',
      priority: 'medium',
    },
  });


  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const fieldsToValidate =
      step === 1
        ? (['name', 'platforms', 'objective', 'dailyBudget', 'adsAssignee', 'deadline', 'client'] as const)
        : ([] as any);

    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (valid) setStep(2);
    } else {
      setStep(2);
    }
  };

  const { mutateAsync: createCampaign } = useCreateCampaign();

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);

    try {
      const payload: CreateCampaignPayload = {
        campaign_name: data.name,
        client_id: clientsList.find((c) => c.name === data.client)?.id || '',
        assigned_to: data.adsAssignee,
        ads_platform: data.platforms,
        objective: data.objective,
        daily_budget: Number(data.dailyBudget),
        deadline_date: data.deadline,
        priority_level: data.priority,
        ...(data.location && { campaign_run_location: data.location }),
        ...(data.targetAudience && { target_audience: data.targetAudience }),
        ...(data.photoVideoLocation && { media_location: data.photoVideoLocation }),
        ...(data.note && { notes: data.note }),
      };

      const response = await createCampaign(payload);

      if (response.success) {
        onSuccess(response.results);
        handleClose();

        reset();
        setStep(1);
      } else {
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  


  const steps = [
    { id: 1, label: STATIC_STRINGS.CREATE_CAMPAIGN_STEP_DETAILS },
    { id: 2, label: STATIC_STRINGS.CREATE_CAMPAIGN_STEP_SETTINGS },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={STATIC_STRINGS.CREATE_CAMPAIGN_TITLE}
      subtitle={STATIC_STRINGS.CREATE_CAMPAIGN_SUBTITLE}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step progress */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={`step-indicator-${s.id}`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      step > s.id
                        ? 'bg-violet-600 text-white'
                        : step === s.id
                          ? 'bg-violet-600 text-white ring-4 ring-violet-100'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span
                    className={`text-[10.5px] mt-1 font-medium whitespace-nowrap ${step >= s.id ? 'text-violet-700' : 'text-slate-400'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${step > s.id ? 'bg-violet-400' : 'bg-slate-200'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto pr-1">
              {/* 1. Campaign Name */}
              <div>
                <Label required>{STATIC_STRINGS.CAMPAIGN_FIELD_NAME}</Label>
                <input
                  type="text"
                  placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_NAME}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  {...register('name', { required: STATIC_STRINGS.FORM_NAME_REQUIRED })}
                />
                {errors.name && (
                  <p className="mt-1 text-[11.5px] text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* 2. Ad Platform */}
              <div>
                <Label required className="mb-2">{STATIC_STRINGS.CREATE_CAMPAIGN_PLATFORM}</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PLATFORM_OPTIONS.filter((p) => p !== STATIC_STRINGS.MULTI_PLATFORM).map((p) => (
                    <label
                      key={`plat-${p}`}
                      className="flex items-center gap-2 rounded-lg cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        value={p}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500/20 border-slate-300"
                        {...register('platforms', {
                          validate: (val) =>
                            val.length > 0 || STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_PLATFORM,
                        })}
                      />
                      <span className="text-[13px] text-slate-600">{p}</span>
                    </label>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="mt-1 text-[11.5px] text-red-600">
                    {errors.platforms.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 3. Objective */}
                <div>
                  <Label required>{STATIC_STRINGS.CREATE_CAMPAIGN_OBJECTIVE}</Label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.objective ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('objective', {
                      required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_OBJECTIVE,
                    })}
                  >
                    <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_OBJECTIVE}</option>
                    {OBJECTIVE_OPTIONS.map((o) => (
                      <option key={`obj-${o}`} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Daily Budget (INR) */}
                <div>
                  <Label required>{STATIC_STRINGS.CREATE_CAMPAIGN_BUDGET}</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
                      {STATIC_STRINGS.CURRENCY_SYMBOL}
                    </span>
                    <input
                      type="number"
                      placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_BUDGET}
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.dailyBudget ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      {...register('dailyBudget', {
                        required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_BUDGET_REQUIRED,
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 5. Location */}
                <div>
                  <Label>{STATIC_STRINGS.CREATE_CAMPAIGN_LOCATION}</Label>
                  <input
                    type="text"
                    placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_LOCATION}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('location')}
                  />
                </div>
                {/* 6. Target Audience */}
                <div>
                  <Label>{STATIC_STRINGS.CREATE_CAMPAIGN_AUDIENCE}</Label>
                  <input
                    type="text"
                    placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_AUDIENCE}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('targetAudience')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 7. Photo/Video Location */}
                <div>
                  <Label>{STATIC_STRINGS.CREATE_CAMPAIGN_MEDIA_LOCATION}</Label>
                  <input
                    type="text"
                    placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_MEDIA_LOCATION}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('photoVideoLocation')}
                  />
                </div>
                {/* 8. Campaign Deadline */}
                <div>
                  <Label required>{STATIC_STRINGS.CREATE_CAMPAIGN_DEADLINE}</Label>
                  <input
                    type="date"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...register('deadline', { required: STATIC_STRINGS.FORM_EMAIL_REQUIRED })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 9. Ad Manager */}
                <div>
                  <Label required>{STATIC_STRINGS.CREATE_CAMPAIGN_AD_MANAGER}</Label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${
                      errors.adsAssignee ? 'border-red-400' : 'border-slate-200'
                    }`}
                    {...register('adsAssignee', {
                      required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_MANAGER,
                    })}
                  >
                    <option value="">
                      {adManagers.length === 0
                        ? STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_MANAGER
                        : STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_MANAGER}
                    </option>

                    {adManagers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.adsAssignee && (
                    <p className="mt-1 text-[11.5px] text-red-600">{errors.adsAssignee.message}</p>
                  )}
                </div>

                {/* 10. Client */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                    {STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${
                      errors.client ? 'border-red-400' : 'border-slate-200'
                    }`}
                    {...register('client', {
                      required: 'Client is required',
                    })}
                  >
                    <option value="">
                      {isFetchingClients
                        ? 'Loading clients...'
                        : STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_CLIENT}
                    </option>
                    {clientsList.map((c) => (
                      <option key={`client-sel-${c.id}`} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.client && (
                    <p className="mt-1 text-[11.5px] text-red-600">{errors.client.message}</p>
                  )}
                </div>
              </div>

              {/* 10. Note */}
              <div>
                <Label>{STATIC_STRINGS.CREATE_CAMPAIGN_NOTE}</Label>
                <textarea
                  rows={2}
                  placeholder={STATIC_STRINGS.CREATE_CAMPAIGN_PLACEHOLDER_NOTE}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none placeholder-slate-400"
                  {...register('note')}
                />
              </div>
            </div>
          )}

          {/* Step 2: Settings & Brief */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{STATIC_STRINGS.CREATE_CAMPAIGN_PRIORITY}</Label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_PRIORITY_DESC}</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('priority')}
                  >
                    <option value="low">{STATIC_STRINGS.PRIORITY_LOW}</option>
                    <option value="medium">{STATIC_STRINGS.PRIORITY_MEDIUM}</option>
                    <option value="high">{STATIC_STRINGS.PRIORITY_HIGH}</option>
                  </select>
                </div>

                <div>
                  <Label>{STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT}</Label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_CLIENT_DESC}</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('client')}
                  >
                    <option value="">{isFetchingClients ? 'Loading clients...' : STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_CLIENT}</option>
                    {clientsList.map((c) => <option key={`client-sel-${c.id}`} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-[12px] text-amber-700 font-medium flex items-center gap-2">
                  <span>⚡</span>
                  {STATIC_STRINGS.CREATE_CAMPAIGN_NOTICE}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? STATIC_STRINGS.FORM_CANCEL : STATIC_STRINGS.CREATE_CAMPAIGN_BACK}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-slate-400">
              {STATIC_STRINGS.CREATE_CAMPAIGN_STEP} {step} {STATIC_STRINGS.CREATE_CAMPAIGN_OF} 2
            </span>
            {step < 2 ? (
              <button
                type="button"
                onClick={(e) => handleNext(e)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150"
              >
                {STATIC_STRINGS.CREATE_CAMPAIGN_CONTINUE}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-all duration-150"
              >
                {isSubmitting ? (
                  <>
                   <LoaderCircle className="w-4 h-4 animate-spin" />
                    {STATIC_STRINGS.CREATE_CAMPAIGN_CREATING}
                  </>
                ) : (
                  STATIC_STRINGS.CREATE_CAMPAIGN_LAUNCH
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
