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
import { auditService } from '@/lib/services/auditService';
import { Campaign } from '@/types';
import { STATIC_STRINGS } from '@/utils/constants';

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

  const { totalEdits, history } = useMemo(() => {
    if (!campaign) return { totalEdits: 0, history: [] };
    return auditService.getEditHistory(campaign);
  }, [campaign]);

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
          {filteredHistory.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[13px] text-slate-400">
                {STATIC_STRINGS.CAMPAIGN_HISTORY_NO_LOGS}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHistory.map((log) => {
                const logId = log.id || `${log.timestamp}-${log.editedBy.userId}`;
                const isExpanded = expandedLogs.has(logId);
                const changeCount = Object.keys(log.changes || {}).length;

                return (
                  <div key={logId} className="group border-b border-slate-50 last:border-0">
                    <div
                      onClick={() => toggleLog(logId)}
                      className="flex items-center py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {/* Left: User Info */}
                      <div className="flex items-center gap-3 w-[200px] shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 border border-slate-200">
                          {log.editedBy.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">
                            {log.editedBy.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">
                            {log.editedBy.role}
                          </p>
                        </div>
                      </div>

                      {/* Center: Activity Summary */}
                      <div className="flex-1 min-w-0 px-4">
                        <p className="text-[13px] text-slate-600 truncate">
                          {STATIC_STRINGS.CAMPAIGN_HISTORY_UPDATED_TEXT}{' '}
                          <span className="font-semibold text-violet-600">{changeCount}</span>{' '}
                          {changeCount === 1
                            ? STATIC_STRINGS.CAMPAIGN_HISTORY_UPDATED_FIELD
                            : STATIC_STRINGS.CAMPAIGN_HISTORY_UPDATED_FIELDS}
                          <span className="text-slate-400 mx-2">•</span>
                          <span className="text-slate-400">
                            {Object.keys(log.changes || {})
                              .map((f) => fieldLabels[f]?.label || f)
                              .join(', ')}
                          </span>
                        </p>
                      </div>

                      {/* Right: Timestamp & Action */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[12px] font-medium text-slate-900">
                            {new Date(log.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Detailed Diff View */}
                    {isExpanded && (
                      <div className="ml-11 mr-2 mb-4 bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="divide-y divide-slate-100">
                          {Object.entries(log.changes || {}).map(([field, vals]: [string, any]) => {
                            const config = fieldLabels[field] || { label: field, icon: Activity };
                            const Icon = config.icon;
                            return (
                              <div key={field} className="flex items-center gap-4 p-3 px-4">
                                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <Icon size={12} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                    {config.label}
                                  </p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[12.5px] text-slate-400 line-through truncate max-w-[150px]">
                                      {String(vals.from || STATIC_STRINGS.CAMPAIGN_HISTORY_EMPTY)}
                                    </span>
                                    <ArrowRight size={12} className="text-slate-300 shrink-0" />
                                    <span className="text-[12.5px] text-slate-900 font-bold">
                                      {String(vals.to || STATIC_STRINGS.CAMPAIGN_HISTORY_EMPTY)}
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
