'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import {
  History,
  ArrowRight,
  Activity,
  DollarSign,
  Tag,
  Layers,
  Calendar,
  UserPlus,
  ChevronDown,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Campaign } from '@/types';
import { STATIC_STRINGS } from '@/utils/constants';
import { useGetCampaignActivity } from '@/api/hooks/useCampaign';
import { Loader2 } from 'lucide-react';

const fieldLabels: Record<string, { label: string; icon: React.ElementType }> = {
  name: { label: STATIC_STRINGS.CAMPAIGN_FIELD_NAME, icon: Tag },
  status: { label: STATIC_STRINGS.CAMPAIGN_FIELD_STATUS, icon: Activity },
  stage: { label: STATIC_STRINGS.CAMPAIGN_FIELD_STAGE, icon: Layers },
  budget: { label: STATIC_STRINGS.CAMPAIGN_FIELD_BUDGET, icon: DollarSign },
  deadline: { label: STATIC_STRINGS.CAMPAIGN_FIELD_DEADLINE, icon: Calendar },
  assignee: { label: STATIC_STRINGS.CAMPAIGN_FIELD_ASSIGNEE, icon: UserPlus },
  platform: { label: STATIC_STRINGS.CAMPAIGN_FIELD_PLATFORM, icon: Activity },
  leads: { label: STATIC_STRINGS.CAMPAIGN_FIELD_LEADS, icon: TrendingUp },
  roas: { label: STATIC_STRINGS.CAMPAIGN_FIELD_ROAS, icon: BarChart3 },
  spend: { label: STATIC_STRINGS.CAMPAIGN_FIELD_SPEND, icon: DollarSign },
};

interface Props {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

export default function CampaignHistoryModal({ open, onClose, campaign }: Props) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const { data: activityData, isLoading } = useGetCampaignActivity();

  const history = useMemo(() => {
    const res = activityData?.results;
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as any)?.data)) return (res as any).data;
    if (Array.isArray((res as any)?.results)) return (res as any).results;
    return [];
  }, [activityData]);

  const totalEdits = history.length;

  const toggleLog = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredHistory = useMemo(() => {
    return history || [];
  }, [history]);

  if (!campaign) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={STATIC_STRINGS.CAMPAIGN_HISTORY_MODAL_TITLE}
      subtitle={campaign.name}
      size="lg"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Header: Info */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <History size={16} className="text-violet-500" />
            <span>{STATIC_STRINGS.CAMPAIGN_HISTORY_TRAIL}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
            <span>
              <strong className="text-slate-900">{totalEdits}</strong>{' '}
              {STATIC_STRINGS.CAMPAIGN_HISTORY_TOTAL_CHANGES}
            </span>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[13px] text-slate-400">
                {STATIC_STRINGS.CAMPAIGN_HISTORY_NO_LOGS}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((log: any) => {
                const logId = log.id;
                const isExpanded = expandedLogs.has(logId);
                const changeCount = log.activity?.updatedFieldsCount || 0;
                const timestamp = log.timestamps?.createdAt;
                const performer = log.actionBy || { name: 'Unknown', role: 'Staff' };
                const changes = log.activity?.updatedFields || [];

                return (
                  <div key={logId} className="group border-b border-slate-50 last:border-0">
                    <div
                      onClick={() => changes.length > 0 && toggleLog(logId)}
                      className={`flex items-center py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors ${changes.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {/* Left: User Info */}
                      <div className="flex items-center gap-3 w-[200px] shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 border border-slate-200">
                          {performer.name
                            ? performer.name.split(' ').map((n: any) => n[0]).join('')
                            : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">
                            {performer.name || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">
                            {performer.role || 'Staff'}
                          </p>
                        </div>
                      </div>

                      {/* Center: Activity Summary */}
                      <div className="flex-1 min-w-0 px-4">
                        <p className="text-[13px] text-slate-600 truncate">
                          <span className="font-semibold text-violet-600">{log.activity?.message || 'Activity'}</span>
                          {changeCount > 0 && (
                            <>
                              <span className="text-slate-400 mx-2">•</span>
                              <span className="text-slate-400">
                                {changes.map((f: any) => fieldLabels[f.fieldName]?.label || f.fieldName).join(', ')}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[12px] font-medium text-slate-900">
                            {timestamp ? new Date(timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            }) : '-'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {timestamp ? new Date(timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </p>
                        </div>
                        {changes.length > 0 && (
                          <ChevronDown
                            size={16}
                            className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Detailed Diff View */}
                    {isExpanded && changes.length > 0 && (
                      <div className="ml-11 mr-2 mb-4 bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="divide-y divide-slate-100">
                          {changes.map((fieldChange: any) => {
                            const config = fieldLabels[fieldChange.fieldName] || { label: fieldChange.fieldName, icon: Activity };
                            const Icon = config.icon;
                            return (
                              <div key={fieldChange.fieldName} className="flex items-center gap-4 p-3 px-4">
                                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <Icon size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                    {config.label}
                                  </p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[12.5px] text-slate-400 line-through truncate max-w-[150px]">
                                      {String(fieldChange.oldValue || STATIC_STRINGS.CAMPAIGN_HISTORY_EMPTY)}
                                    </span>
                                    <ArrowRight size={12} className="text-slate-300 shrink-0" />
                                    <span className="text-[12.5px] text-slate-900 font-bold">
                                      {String(fieldChange.newValue || STATIC_STRINGS.CAMPAIGN_HISTORY_EMPTY)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-[12px] text-slate-400 italic">
            {STATIC_STRINGS.CAMPAIGN_HISTORY_IMMUTABLE_NOTICE}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            {STATIC_STRINGS.CAMPAIGN_HISTORY_DONE}
          </button>
        </div>
      </div>
    </Modal>
  );
}
