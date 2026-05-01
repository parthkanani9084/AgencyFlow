'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Building2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { superAdminAgent } from '@/agents/superAdminAgent';
import { TeamMember } from '@/types';
import { SUPER_ADMIN_ACTIONS, STATIC_STRINGS } from '@/utils/constants';

interface OwnerFormProps {
  owner?: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEditOwnerModal({ owner, onClose, onSuccess }: OwnerFormProps) {
  const isEdit = !!owner;
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: owner?.name || '',
      agencyName: owner?.agencyName || '',
      email: owner?.email || '',
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let result;
      if (isEdit && owner) {
        result = await superAdminAgent.processAction(SUPER_ADMIN_ACTIONS.UPDATE_OWNER, { 
          id: owner.id, 
          data 
        });
      } else {
        result = await superAdminAgent.processAction(SUPER_ADMIN_ACTIONS.ADD_OWNER, data);
      }

      if (result.success) {
        toast.success(isEdit ? STATIC_STRINGS.FORM_ACCOUNT_UPDATED : STATIC_STRINGS.FORM_ACCOUNT_CREATED);
        onSuccess();
      } else {

      }
    } catch (error) {
      toast.error(STATIC_STRINGS.FORM_SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">{STATIC_STRINGS.FORM_FULL_NAME}</label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Sarah Mitchell"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('name', { required: STATIC_STRINGS.FORM_NAME_REQUIRED })}
          />
        </div>
        {errors.name && <p className="text-[10px] text-red-500 pl-1">{(errors.name as any).message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">{STATIC_STRINGS.FORM_AGENCY_NAME}</label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Nova Media"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('agencyName', { required: STATIC_STRINGS.FORM_AGENCY_REQUIRED })}
          />
        </div>
        {errors.agencyName && <p className="text-[10px] text-red-500 pl-1">{(errors.agencyName as any).message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">{STATIC_STRINGS.FORM_EMAIL_ADDRESS}</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="email" 
            placeholder="sarah@agency.com"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('email', { 
              required: STATIC_STRINGS.FORM_EMAIL_REQUIRED,
              pattern: { value: /^\S+@\S+\.\S+$/, message: STATIC_STRINGS.FORM_INVALID_FORMAT }
            })}
          />
        </div>
        {errors.email && <p className="text-[10px] text-red-500 pl-1">{(errors.email as any).message}</p>}
      </div>

      <div className="pt-4 flex items-center justify-end gap-3">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {STATIC_STRINGS.FORM_CANCEL}
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 text-white text-[13px] font-bold rounded-lg hover:bg-violet-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (isEdit ? STATIC_STRINGS.FORM_SAVING : STATIC_STRINGS.FORM_CREATING) : (isEdit ? STATIC_STRINGS.FORM_SAVE_CHANGES : STATIC_STRINGS.FORM_CREATE_ACCOUNT)}
        </button>
      </div>
    </form>
  );
}
