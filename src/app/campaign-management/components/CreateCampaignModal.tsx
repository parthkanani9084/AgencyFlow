'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS, CLIENT_OPTIONS, TEAM_MEMBERS, OBJECTIVE_OPTIONS, PLATFORM_OPTIONS } from '@/utils/constants';
import { ROLES } from '@/constants/roles';

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
    const fieldsToValidate = step === 1
      ? (['name', 'platforms', 'objective', 'dailyBudget', 'adsAssignee', 'deadline'] as const)
      : ([] as any);
    
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (valid) setStep(2);
    } else {
      setStep(2);
    }
  };

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    // BACKEND INTEGRATION: POST /api/campaigns with data
    await new Promise((r) => setTimeout(r, 1100));
    const idNum = Math.floor(Math.random() * 900) + 100;
    const newCampaign = {
      id: `camp-${idNum}`,
      name: data.name,
      client: data.client,
      status: STATIC_STRINGS.ADS_STATUS_DRAFT,
      stage: 'in draft',
      assignee: TEAM_MEMBERS.find((m) => m.id === data.adsAssignee)?.name ?? STATIC_STRINGS.COMMON_UNASSIGNED,
      assigneeInitials: (TEAM_MEMBERS.find((m) => m.id === data.adsAssignee)?.name ?? STATIC_STRINGS.COMMON_UNASSIGNED_INITIALS).split(' ').map((n) => n[0]).join(''),
      deadline: data.deadline,
      spend: `${STATIC_STRINGS.CURRENCY_SYMBOL}0`,
      budget: `${STATIC_STRINGS.CURRENCY_SYMBOL}${Number(data.dailyBudget).toLocaleString()}${STATIC_STRINGS.BUDGET_PER_DAY}`,
      leads: 0,
      roas: 0,
      platform: data.platforms.length > 1 ? STATIC_STRINGS.MULTI_PLATFORM : (data.platforms[0] || STATIC_STRINGS.DEFAULT_PLATFORM),
      progress: 0,
      createdAt: new Date().toLocaleDateString(),
    };
    setIsSubmitting(false);
    reset();
    setStep(1);
    onSuccess(newCampaign);
  };

  const steps = [
    { id: 1, label: STATIC_STRINGS.CREATE_CAMPAIGN_STEP_DETAILS },
    { id: 2, label: STATIC_STRINGS.CREATE_CAMPAIGN_STEP_SETTINGS },
  ];

  return (
    <Modal open={open} onClose={handleClose} title={STATIC_STRINGS.CREATE_CAMPAIGN_TITLE} subtitle={STATIC_STRINGS.CREATE_CAMPAIGN_SUBTITLE} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step progress */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={`step-indicator-${s.id}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    step > s.id ? 'bg-violet-600 text-white' :
                    step === s.id ? 'bg-violet-600 text-white ring-4 ring-violet-100': 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className={`text-[10.5px] mt-1 font-medium whitespace-nowrap ${step >= s.id ? 'text-violet-700' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${step > s.id ? 'bg-violet-400' : 'bg-slate-200'}`} />
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
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CAMPAIGN_FIELD_NAME} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Spring Launch Campaign"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  {...register('name', { required: STATIC_STRINGS.FORM_NAME_REQUIRED })}
                />
                {errors.name && <p className="mt-1 text-[11.5px] text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 2. Ad Platform */}
                <div className="col-span-2">
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">{STATIC_STRINGS.CREATE_CAMPAIGN_PLATFORM} <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PLATFORM_OPTIONS.filter(p => p !== STATIC_STRINGS.MULTI_PLATFORM).map((p) => (
                      <label key={`plat-${p}`} className="flex items-center gap-2 rounded-lg cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          value={p}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500/20 border-slate-300"
                          {...register('platforms', { validate: (val) => val.length > 0 || STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_PLATFORM })}
                        />
                        <span className="text-[13px] text-slate-600">{p}</span>
                      </label>
                    ))}
                  </div>
                  {errors.platforms && <p className="mt-1 text-[11.5px] text-red-600">{errors.platforms.message as string}</p>}
                </div>

                {/* 3. Objective (Moved to full row or separate depending on space) */}
                <div className="col-span-2">
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_OBJECTIVE} <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.objective ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('objective', { required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_OBJECTIVE })}
                  >
                    <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_OBJECTIVE}</option>
                    {OBJECTIVE_OPTIONS.map((o) => <option key={`obj-${o}`} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 4. Daily Budget (INR) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_BUDGET} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">{STATIC_STRINGS.CURRENCY_SYMBOL}</span>
                    <input
                      type="number"
                      placeholder="500"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.dailyBudget ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      {...register('dailyBudget', { required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_BUDGET_REQUIRED })}
                    />
                  </div>
                </div>
                {/* 5. Location */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_LOCATION}</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('location')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 6. Target Audience */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_AUDIENCE}</label>
                  <input
                    type="text"
                    placeholder="e.g. Students 18-24"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('targetAudience')}
                  />
                </div>
                {/* 7. Photo/Video Location */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_MEDIA_LOCATION}</label>
                  <input
                    type="text"
                    placeholder="Drive link or storage path"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('photoVideoLocation')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 8. Ad Manager (Relocated) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_AD_MANAGER} <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.adsAssignee ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('adsAssignee', { required: STATIC_STRINGS.CREATE_CAMPAIGN_ERR_SELECT_MANAGER })}
                  >
                    <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_MANAGER}</option>
                    {TEAM_MEMBERS.filter((m) => m.role === ROLES.ADS_MANAGER || m.role === ROLES.MANAGER).map((m) => (
                      <option key={`mgr-${m.id}`} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                {/* Campaign Deadline from original flow (kept for data completeness) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_DEADLINE} <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...register('deadline', { required: STATIC_STRINGS.FORM_EMAIL_REQUIRED })}
                  />
                </div>
              </div>

              {/* 9. Note */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_NOTE}</label>
                <textarea
                  rows={3}
                  placeholder="Additional campaign instructions..."
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_PRIORITY}</label>
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CAMPAIGN_FIELD_CLIENT}</label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">{STATIC_STRINGS.CREATE_CAMPAIGN_CLIENT_DESC}</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('client')}
                  >
                    <option value="">{STATIC_STRINGS.CREATE_CAMPAIGN_SELECT_CLIENT}</option>
                    {CLIENT_OPTIONS.map((c) => <option key={`client-sel-${c}`} value={c}>{c}</option>)}
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
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {step === 1 ? STATIC_STRINGS.FORM_CANCEL : STATIC_STRINGS.CREATE_CAMPAIGN_BACK}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-slate-400">{STATIC_STRINGS.CREATE_CAMPAIGN_STEP} {step} {STATIC_STRINGS.CREATE_CAMPAIGN_OF} 2</span>
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
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
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