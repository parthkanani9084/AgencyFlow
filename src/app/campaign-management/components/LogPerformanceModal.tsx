'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, TrendingUp, Users, DollarSign } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface PerformanceFormValues {
  spend: number;
  leads: number;
  roas: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  campaign: any;
  onSuccess: (updatedCampaign: any) => void;
}

export default function LogPerformanceModal({ open, onClose, campaign, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<PerformanceFormValues>({
    defaultValues: { spend: 0, leads: 0, roas: 0 }
  });

  // Reset form when opened with a new campaign
  React.useEffect(() => {
    if (open) {
      reset({ spend: 0, leads: 0, roas: 0 });
    }
  }, [open, reset]);

  const onSubmit = async (data: PerformanceFormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    
    // Parse previous values
    const prevSpend = Number(String(campaign?.spend || '').replace(/[^0-9.-]+/g, "")) || 0;
    const prevLeads = Number(campaign?.leads) || 0;
    const prevRoas = Number(campaign?.roas) || 0;

    // Parse new inputs
    const addedSpend = Number(data.spend) || 0;
    const addedLeads = Number(data.leads) || 0;
    const addedRoas = Number(data.roas) || 0;

    // Additive logic
    const totalSpend = prevSpend + addedSpend;
    const totalLeads = prevLeads + addedLeads;

    // ROAS Logic: 
    // Since ROAS is a ratio, users typically want to input the NEW overall ROAS from their ad platform.
    // If they input > 0, we update the campaign's overall ROAS to match exactly.
    // If they leave it at 0 (default), we keep the previous ROAS.
    const totalRoas = addedRoas > 0 ? addedRoas : prevRoas;

    const updatedCampaign = {
      ...campaign,
      spend: `$${totalSpend.toLocaleString()}`,
      leads: totalLeads,
      roas: totalRoas,
      performanceHistory: [
        {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toLocaleDateString('en-GB'),
          addedSpend,
          addedLeads,
          newRoas: totalRoas
        },
        ...(campaign?.performanceHistory || [])
      ]
    };
    
    setIsSubmitting(false);
    onSuccess(updatedCampaign);
  };

  const handleDeleteLog = (logId: string) => {
    const logToDelete = campaign.performanceHistory.find((l: any) => l.id === logId);
    if (!logToDelete) return;

    // Parse current totals
    const currentSpend = Number(String(campaign?.spend || '').replace(/[^0-9.-]+/g, "")) || 0;
    const currentLeads = Number(campaign?.leads) || 0;

    // Subtract deleted metrics
    const newSpend = Math.max(0, currentSpend - logToDelete.addedSpend);
    const newLeads = Math.max(0, currentLeads - logToDelete.addedLeads);
    
    const updatedHistory = campaign.performanceHistory.filter((l: any) => l.id !== logId);

    const updatedCampaign = {
      ...campaign,
      spend: `₹${newSpend.toLocaleString()}`,
      leads: newLeads,
      performanceHistory: updatedHistory
    };

    onSuccess(updatedCampaign);
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Log Daily Performance" 
      subtitle={`Add new metrics for ${campaign?.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Add to Spend</label>
          <input
            type="number"
            placeholder="e.g. 500"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('spend')}
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Add to Leads</label>
          <input
            type="number"
            placeholder="e.g. 50"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('leads')}
          />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">New Overall ROAS (Optional)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 3.5"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('roas')}
          />
        </div>

        {campaign?.performanceHistory && campaign.performanceHistory.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-3">Update History</h3>
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Spend</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Leads</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ROAS</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {campaign.performanceHistory.map((log: any) => (
                    <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {(() => {
                          const date = new Date(log.date);
                          if (isNaN(date.getTime())) return log.date;
                          return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-emerald-600 text-right">+₹{log.addedSpend.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-blue-600 text-right">+{log.addedLeads}</td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-slate-800 text-right">{log.newRoas > 0 ? `${log.newRoas}×` : '—'}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
            {isSubmitting ? 'Saving...' : 'Add Metrics'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
