'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { History, User, Clock, CheckCircle2, ArrowRight, Activity, DollarSign, Tag, Layers, Calendar, UserPlus } from 'lucide-react';
import { auditService } from '@/lib/services/auditService';
import { Campaign } from '@/types';

const fieldLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  name: { label: 'Campaign Name', icon: Tag, color: 'text-blue-600' },
  status: { label: 'Status Change', icon: Activity, color: 'text-emerald-600' },
  stage: { label: 'Workflow Stage', icon: Layers, color: 'text-violet-600' },
  budget: { label: 'Budget Adjusted', icon: DollarSign, color: 'text-amber-600' },
  deadline: { label: 'Deadline Moved', icon: Calendar, color: 'text-rose-600' },
  assignee: { label: 'Assignee Changed', icon: UserPlus, color: 'text-indigo-600' },
  platform: { label: 'Platform Updated', icon: Activity, color: 'text-sky-600' },
  leads: { label: 'Leads Updated', icon: Activity, color: 'text-emerald-600' },
  roas: { label: 'ROAS Logged', icon: Activity, color: 'text-emerald-600' },
  spend: { label: 'Spend Logged', icon: DollarSign, color: 'text-amber-600' },
};

interface Props {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export default function CampaignHistoryModal({ open, onClose, campaign }: Props) {
  if (!campaign) return null;

  const { totalEdits, history, } = auditService.getEditHistory(campaign);

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Campaign Edit History" 
      subtitle={`Detailed audit log for ${campaign.name}`}
      size="lg"
    >
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1 text-slate-500">
              <History size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Edits</span>
            </div>
            <p className="text-[20px] font-bold text-slate-900">{totalEdits}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {history.length === 0 ? (
            <div className="pl-8 py-4 text-center text-slate-400 text-[13px]">
              No edit history found for this campaign.
            </div>
          ) : (
            history.map((log, idx) => (
              <div key={log.id || idx} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-white border-2 border-violet-500 flex items-center justify-center z-10 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                </div>
                
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-violet-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {log.editedBy.name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-bold text-slate-900">{log.editedBy.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{log.editedBy.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[11.5px] font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audit Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(log.changes).map(([field, vals]: [string, any]) => {
                          const config = fieldLabels[field] || { label: field, icon: Activity, color: 'text-slate-500' };
                          const FieldIcon = config.icon;
                          
                          return (
                            <div key={field} className="group">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <FieldIcon size={12} className={config.color} />
                                <span className="text-[11.5px] font-bold text-slate-700">{config.label}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 group-hover:border-violet-100 transition-colors">
                                <span className="text-[12px] text-slate-400 line-through truncate max-w-[90px]">{String(vals.from || 'None')}</span>
                                <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                                <span className="text-[12px] text-slate-900 font-bold truncate max-w-[120px]">{String(vals.to || 'None')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </Modal>
  );
}
