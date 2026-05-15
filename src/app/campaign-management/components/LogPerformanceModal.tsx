'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Label from '@/components/ui/Label';
import { STATIC_STRINGS } from '@/utils/constants';
import { useLogPerformance, useGetPerformanceHistory, useDeletePerformanceHistory } from '@/api/hooks/useCampaign';

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
  const { mutateAsync: logPerformance } = useLogPerformance();
  const { data: historyData, isLoading: isLoadingHistory } = useGetPerformanceHistory(campaign?.id);
  const { mutateAsync: deleteHistory, isPending: isDeleting } = useDeletePerformanceHistory();
  const history = historyData?.results?.history || [];

  const { register, handleSubmit, reset } = useForm<PerformanceFormValues>({
    defaultValues: { spend: 0, leads: 0, roas: 0 },
  });

  // Reset form when opened with a new campaign
  React.useEffect(() => {
    if (open) {
      reset({ spend: 0, leads: 0, roas: 0 });
    }
  }, [open, reset]);

  const onSubmit = async (data: PerformanceFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ads_spend: Number(data.spend) || 0,
        ads_leads: Number(data.leads) || 0,
        ads_roas: Number(data.roas) || 0,
      };

      const response = await logPerformance({
        campaignId: campaign.id,
        payload,
      });

      if (response.success) {
        onSuccess(response.results);
      }
    } catch (error) {

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      const response = await deleteHistory(historyId);
      if (response.success) {

      }
    } catch (error) {
      console.error('Delete history error:', error);
      toast.error('Failed to delete log');
    }
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title={STATIC_STRINGS.LOG_PERFORMANCE_TITLE}
      subtitle={`${STATIC_STRINGS.LOG_PERFORMANCE_SUBTITLE} ${campaign?.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <Label>{STATIC_STRINGS.LOG_PERFORMANCE_LABEL_ADD_SPEND}</Label>
          <input
            type="number"
            placeholder="e.g. 500"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('spend')}
          />
        </div>
        <div>
          <Label>{STATIC_STRINGS.LOG_PERFORMANCE_LABEL_ADD_LEADS}</Label>
          <input
            type="number"
            placeholder="e.g. 50"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('leads')}
          />
        </div>
        <div>
          <Label>{STATIC_STRINGS.LOG_PERFORMANCE_LABEL_ROAS_OPTIONAL}</Label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 3.5"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            {...register('roas')}
          />
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          </div>
        ) : history.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider mb-3">
              {STATIC_STRINGS.LOG_PERFORMANCE_HISTORY_TITLE}
            </h3>
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {STATIC_STRINGS.TABLE_DATE}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      {STATIC_STRINGS.ADS_TABLE_COL_SPEND}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      {STATIC_STRINGS.ADS_TABLE_COL_LEADS}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      {STATIC_STRINGS.ADS_TABLE_COL_ROAS}
                    </th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((log: any) => (
                    <tr key={log.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                        {log.performance_date ? new Date(log.performance_date).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-emerald-600 text-right">
                        +{STATIC_STRINGS.CURRENCY_SYMBOL}
                        {Number(log.ads_spend ||"0").toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-blue-600 text-right">
                        +{log.ads_leads}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-bold text-slate-800 text-right">
                        {log.ads_roas > 0 ? `${log.ads_roas}×` : 0}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteHistory(log.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
                          title={STATIC_STRINGS.LOG_PERFORMANCE_DELETE_LOG}
                        >
                          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
            {isSubmitting
              ? STATIC_STRINGS.LOG_PERFORMANCE_SAVING
              : STATIC_STRINGS.LOG_PERFORMANCE_ADD_BTN}
          </button>
        </div>
      </form>
    </Modal>
  );
}
