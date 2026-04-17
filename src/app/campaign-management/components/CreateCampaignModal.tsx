'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';

// BACKEND INTEGRATION: POST /api/campaigns → { campaign }

interface CampaignFormValues {
  name: string;
  client: string;
  platform: string;
  budget: string;
  deadline: string;
  shooterAssignee: string;
  editorAssignee: string;
  adsAssignee: string;
  brief: string;
  priority: 'low' | 'medium' | 'high';
  recurringType: 'none' | 'weekly' | 'monthly';
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
      platform: '',
      budget: '',
      deadline: '',
      shooterAssignee: '',
      editorAssignee: '',
      adsAssignee: '',
      brief: '',
      priority: 'medium',
      recurringType: 'none',
    },
  });

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const handleNext = async () => {
    const fieldsToValidate = step === 1
      ? (['name', 'client', 'platform', 'budget', 'deadline'] as const)
      : (['shooterAssignee', 'editorAssignee', 'adsAssignee'] as const);
    const valid = await trigger(fieldsToValidate);
    if (valid) setStep((s) => s + 1);
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
      stage: 'Briefing' as const,
      assignee: teamMembers.find((m) => m.id === data.shooterAssignee)?.name ?? 'Unassigned',
      assigneeInitials: (teamMembers.find((m) => m.id === data.shooterAssignee)?.name ?? 'UN').split(' ').map((n) => n[0]).join(''),
      deadline: data.deadline,
      spend: '$0',
      budget: `$${Number(data.budget).toLocaleString()}`,
      leads: 0,
      roas: 0,
      platform: data.platform as any,
      progress: 0,
      createdAt: '04/09/2026',
    };
    setIsSubmitting(false);
    reset();
    setStep(1);
    onSuccess(newCampaign);
  };

  const steps = [
    { id: 1, label: 'Campaign Details' },
    { id: 2, label: 'Team Assignment' },
    { id: 3, label: 'Settings & Brief' },
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
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
                <p className="text-[11.5px] text-slate-400 mb-1.5">Give this campaign a clear, descriptive name your team will recognize.</p>
                <input
                  type="text"
                  placeholder="e.g. Spring Collection Launch — Meta"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  {...register('name', { required: 'Campaign name is required', minLength: { value: 4, message: 'Name must be at least 4 characters' } })}
                />
                {errors.name && <p className="mt-1 text-[11.5px] text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Client <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.client ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('client', { required: 'Select a client' })}
                  >
                    <option value="">Select client…</option>
                    {clientOptions.map((c) => <option key={`client-sel-${c}`} value={c}>{c}</option>)}
                  </select>
                  {errors.client && <p className="mt-1 text-[11.5px] text-red-600">{errors.client.message}</p>}
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Ad Platform <span className="text-red-500">*</span></label>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors.platform ? 'border-red-400' : 'border-slate-200'}`}
                    {...register('platform', { required: 'Select a platform' })}
                  >
                    <option value="">Select platform…</option>
                    {['Meta', 'Google', 'TikTok', 'LinkedIn', 'Multi'].map((p) => <option key={`plat-sel-${p}`} value={p}>{p}</option>)}
                  </select>
                  {errors.platform && <p className="mt-1 text-[11.5px] text-red-600">{errors.platform.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Total Budget (USD) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
                    <input
                      type="number"
                      min="500"
                      placeholder="10000"
                      className={`w-full pl-7 pr-3.5 py-2.5 rounded-lg border text-[13px] font-mono outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.budget ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                      {...register('budget', { required: 'Budget is required', min: { value: 500, message: 'Minimum budget is $500' } })}
                    />
                  </div>
                  {errors.budget && <p className="mt-1 text-[11.5px] text-red-600">{errors.budget.message}</p>}
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign Deadline <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...register('deadline', { required: 'Deadline is required' })}
                  />
                  {errors.deadline && <p className="mt-1 text-[11.5px] text-red-600">{errors.deadline.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Assignment */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-2">
                <p className="text-[12.5px] text-violet-700 font-medium">
                  AgencyFlow will automatically route tasks through your team as each stage completes.
                  Assign the right person to each role below.
                </p>
              </div>

              {[
                { key: 'shooterAssignee', label: 'Shooter', desc: 'Responsible for filming raw content', role: 'Shooter', field: 'shooterAssignee' as const },
                { key: 'editorAssignee', label: 'Editor', desc: 'Receives task automatically after shooting completes', role: 'Editor', field: 'editorAssignee' as const },
                { key: 'adsAssignee', label: 'Ads Manager', desc: 'Receives task automatically after editing completes', role: 'Ads Manager', field: 'adsAssignee' as const },
              ].map((assignment) => (
                <div key={`assign-${assignment.key}`}>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">
                    {assignment.label} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">{assignment.desc}</p>
                  <select
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white ${errors[assignment.field] ? 'border-red-400' : 'border-slate-200'}`}
                    {...register(assignment.field, { required: `${assignment.label} is required` })}
                  >
                    <option value="">Select {assignment.label}…</option>
                    {teamMembers
                      .filter((m) => assignment.role === 'Ads Manager' ? m.role === 'Ads Manager' : m.role === assignment.role)
                      .map((m) => (
                        <option key={`member-${assignment.key}-${m.id}`} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                  {errors[assignment.field] && (
                    <p className="mt-1 text-[11.5px] text-red-600">{errors[assignment.field]?.message}</p>
                  )}
                </div>
              ))}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[11.5px] text-slate-500 font-medium mb-2">Workflow Auto-Progression</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Briefing', '→', 'Shooting', '→', 'Editing', '→', 'Ads Setup', '→', 'Ads Live', '→', 'Review', '→', 'Completed'].map((stage, i) => (
                    <span
                      key={`workflow-stage-${i}`}
                      className={`text-[11px] font-semibold ${stage === '→' ? 'text-slate-300' : 'bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-100'}`}
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Settings & Brief */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Priority Level</label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">Sets task urgency for your team members.</p>
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
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Recurring Schedule</label>
                  <p className="text-[11.5px] text-slate-400 mb-1.5">Auto-create this campaign on a schedule.</p>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
                    {...register('recurringType')}
                  >
                    <option value="none">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Campaign Brief</label>
                <p className="text-[11.5px] text-slate-400 mb-1.5">
                  Describe the campaign goal, target audience, and key messages. Shared with all assigned team members.
                </p>
                <textarea
                  rows={5}
                  placeholder="e.g. Spring launch campaign targeting women 25–40 in the US. Focus on new arrivals, use lifestyle shots. Key message: 'Fresh looks for the new season.' CTA: Shop Now."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none placeholder-slate-400"
                  {...register('brief')}
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-[12px] text-amber-700 font-medium flex items-center gap-2">
                  <span>⚡</span>
                  After creation, the Shooter will receive an immediate task notification and the workflow will begin automatically.
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
            <span className="text-[11.5px] text-slate-400">Step {step} of 3</span>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
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