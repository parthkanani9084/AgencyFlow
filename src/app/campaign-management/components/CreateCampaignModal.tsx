'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';

// BACKEND INTEGRATION: POST /api/campaigns → { campaign }

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

const clientOptions = [
  'Luma Apparel', 'Nexus Capital', 'Orion Fitness', 'Synapse Tech',
  'Coral Beauty', 'Pulse Nutrition', 'Helios Solar', 'Bloom Skincare',
];

const teamMembers = [
  { id: 'user-001', name: 'Marco Reyes', role: 'Shooter' },
  { id: 'user-002', name: 'Jin Park', role: 'Editor' },
  { id: 'user-003', name: 'Sofia Nguyen', role: 'Ads Manager' },
  { id: 'user-004', name: 'Priya Sharma', role: 'Manager' },
  { id: 'user-005', name: 'Kai Tanaka', role: 'Shooter' },
  { id: 'user-006', name: 'Amara Diallo', role: 'Editor' },
];

const objectiveOptions = [
  'Traffic', 'Awareness', 'Sales', 'Engagement', 'Leads', 'App Promotion',
];

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
      status: 'draft' as const,
      stage: 'in draft' as const,
      assignee: teamMembers.find((m) => m.id === data.adsAssignee)?.name ?? 'Unassigned',
      assigneeInitials: (teamMembers.find((m) => m.id === data.adsAssignee)?.name ?? 'UN').split(' ').map((n) => n[0]).join(''),
      deadline: data.deadline,
      spend: '₹0',
      budget: `₹${Number(data.dailyBudget).toLocaleString()}/day`,
      leads: 0,
      roas: 0,
      platform: data.platforms.length > 1 ? 'Multi' : (data.platforms[0] || 'Meta'),
      progress: 0,
      createdAt: new Date().toLocaleDateString(),
    };
    setIsSubmitting(false);
    reset();
    setStep(1);
    onSuccess(newCampaign);
  };

  const steps = [
    { id: 1, label: 'Campaign Details' },
    { id: 2, label: 'Settings & Brief' },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="Create New Campaign" subtitle="Set up workflow automation and assign your team" size="lg">
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
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Spring Launch Campaign"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="mt-1 text-[11.5px] text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 2. Ad Platform */}
                <div className="col-span-2">
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">Ad Platform <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Facebook', 'Instagram', 'Google', 'TikTok', 'LinkedIn'].map((p) => (
                      <label key={`plat-${p}`} className="flex items-center gap-2 rounded-lg cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          value={p}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500/20 border-slate-300"
                          {...register('platforms', { validate: (val) => val.length > 0 || 'Select at least one platform' })}
                        />
                        <span className="text-[13px] text-slate-600">{p}</span>
                      </label>
                    ))}
                  </div>
                  {errors.platforms && <p className="mt-1 text-[11.5px] text-red-600">{errors.platforms.message as string}</p>}
                </div>

                {/* 3. Objective (Moved to full row or separate depending on space) */}
                <div className="col-span-2">
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Objective <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.objective ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('objective', { required: 'Select objective' })}
                  >
                    <option value="">Select objective…</option>
                    {objectiveOptions.map((o) => <option key={`obj-${o}`} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 4. Daily Budget (INR) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Daily Budget (INR) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">₹</span>
                    <input
                      type="number"
                      placeholder="500"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.dailyBudget ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      {...register('dailyBudget', { required: 'Daily budget is required' })}
                    />
                  </div>
                </div>
                {/* 5. Location */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Location</label>
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Students 18-24"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    {...register('targetAudience')}
                  />
                </div>
                {/* 7. Photo/Video Location */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Photo/Video Location</label>
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Ad Manager <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.adsAssignee ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('adsAssignee', { required: 'Select an Ad Manager' })}
                  >
                    <option value="">Select Ad Manager…</option>
                    {teamMembers.filter((m) => m.role === 'Ads Manager' || m.role === 'Manager').map((m) => (
                      <option key={`mgr-${m.id}`} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                {/* Campaign Deadline from original flow (kept for data completeness) */}
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...register('deadline', { required: 'Deadline is required' })}
                  />
                </div>
              </div>

              {/* 9. Note */}
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Note</label>
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Priority Level</label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">Sets task urgency for your team.</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('priority')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High — Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client Name</label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">Associate this campaign with a client.</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('client')}
                  >
                    <option value="">Select client…</option>
                    {clientOptions.map((c) => <option key={`client-sel-${c}`} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-[12px] text-amber-700 font-medium flex items-center gap-2">
                  <span>⚡</span>
                  After creation, the Ad Manager will receive a notification and the workflow will begin.
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
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-slate-400">Step {step} of 2</span>
            {step < 2 ? (
              <button
                type="button"
                onClick={(e) => handleNext(e)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150"
              >
                Continue →
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
                    Creating Campaign…
                  </>
                ) : (
                  'Launch Campaign ⚡'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}