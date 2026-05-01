'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Building2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { superAdminAgent } from '@/agents/superAdminAgent';
import { TeamMember } from '@/types';

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
        result = await superAdminAgent.processAction('update_owner', { 
          id: owner.id, 
          data 
        });
      } else {
        result = await superAdminAgent.processAction('add_owner', data);
      }

      if (result.success) {
        toast.success(isEdit ? 'Account updated' : 'Account created');
        onSuccess();
      } else {

      }
    } catch (error) {
      toast.error('System error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">Full Name</label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Sarah Mitchell"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('name', { required: 'Name is required' })}
          />
        </div>
        {errors.name && <p className="text-[10px] text-red-500 pl-1">{(errors.name as any).message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">Agency Name</label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Nova Media"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('agencyName', { required: 'Agency is required' })}
          />
        </div>
        {errors.agencyName && <p className="text-[10px] text-red-500 pl-1">{(errors.agencyName as any).message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700 pl-1">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="email" 
            placeholder="sarah@agency.com"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all"
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid format' }
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
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 text-white text-[13px] font-bold rounded-lg hover:bg-violet-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Account')}
        </button>
      </div>
    </form>
  );
}
