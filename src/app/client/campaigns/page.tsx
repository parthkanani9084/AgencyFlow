'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import Badge from '@/components/ui/Badge';
import { 
  Megaphone, 
  Target, 
  TrendingUp,
  Calendar,
  Check,
  Activity,
  DollarSign,
  Users
} from 'lucide-react';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';

interface CampaignMetrics {
  spend: number;
  leads: number;
  roas: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  objective: string;
  dailyBudget: number;
  status: string;
  stage: string;
  startDate: string;
  endDate?: string;
  metrics?: CampaignMetrics;
}

const WORKFLOW_STAGES = ['Shooting', 'Raw Upload', 'Editing', 'Ads', 'Complete'];

export default function ClientCampaignsPage() {
  useRoleGuard([ROLES.CLIENT]);
  const [campaigns] = useState<Campaign[]>([
    {
      id: 'cmp1',
      name: 'NovaBrew Spring Launch',
      platform: 'Instagram',
      objective: 'Lead Generation',
      dailyBudget: 1500,
      status: STATIC_STRINGS.ADS_STATUS_ACTIVE,
      stage: 'Ads',
      startDate: 'Apr 15, 2026',
      metrics: { spend: 24500, leads: 420, roas: 3.2 }
    },
    {
      id: 'cmp2',
      name: 'New Coffee Flavor Promo',
      platform: 'Facebook',
      objective: 'Conversion',
      dailyBudget: 1000,
      status: 'In Progress',
      stage: 'Editing',
      startDate: 'Apr 25, 2026',
    },
    {
      id: 'cmp3',
      name: 'NovaBrew Community Event',
      platform: 'Instagram',
      objective: 'Brand Awareness',
      dailyBudget: 500,
      status: STATIC_STRINGS.ADS_STATUS_COMPLETED,
      stage: 'Complete',
      startDate: 'Mar 01, 2026',
      endDate: 'Mar 15, 2026',
      metrics: { spend: 7500, leads: 185, roas: 4.5 }
    }
  ]);

  const activeCount = useMemo(() => 
    campaigns.filter(c => [STATIC_STRINGS.ADS_STATUS_ACTIVE, 'In Progress'].includes(c.status)).length,
  [campaigns]);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto pb-12">
        <main className="space-y-6">
          
          {/* Dashboard Header */}
          <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <Megaphone size={24} />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.CLIENT_CAMPAIGNS_TITLE}</h1>
                <p className="text-[13.5px] text-slate-500 mt-0.5">{STATIC_STRINGS.CLIENT_CAMPAIGNS_SUBTITLE}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-lg self-start sm:self-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[13px] font-bold text-emerald-700">
                {activeCount} {activeCount === 1 ? STATIC_STRINGS.CLIENT_CAMPAIGNS_ACTIVE_SINGLE : STATIC_STRINGS.CLIENT_CAMPAIGNS_ACTIVE_PLURAL}
              </span>
            </div>
          </header>

          {/* Campaign Visualization Feed */}
          <section className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center">
                <Megaphone size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400 font-medium tracking-tight">{STATIC_STRINGS.CLIENT_CAMPAIGNS_NO_CAMPAIGNS}</p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const stageIndex = WORKFLOW_STAGES.indexOf(campaign.stage);
                const progressPercentage = (stageIndex / (WORKFLOW_STAGES.length - 1)) * 100;

                return (
                  <article 
                    key={campaign.id} 
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="p-6 md:p-8">
                      
                      {/* Campaign Primary Info */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">{campaign.name}</h3>
                            <Badge 
                              variant={campaign.status === 'Active' ? 'active' : campaign.status === 'In Progress' ? 'pending' : 'completed'} 
                              label={campaign.status} 
                            />
                          </div>
                          <div className="flex items-center gap-4 text-[13px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Target size={14} className="text-violet-500" />
                              {campaign.platform} — {campaign.objective}
                            </span>
                            <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                              <Calendar size={14} className="text-slate-400" />
                              {campaign.startDate} {campaign.endDate ? `- ${campaign.endDate}` : STATIC_STRINGS.CLIENT_CAMPAIGNS_ONGOING}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 flex flex-col items-start md:items-end min-w-[140px]">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{STATIC_STRINGS.CREATE_CAMPAIGN_BUDGET.replace('(INR)', '').trim()}</p>
                          <p className="text-lg font-bold text-slate-900 tabular-nums">{STATIC_STRINGS.CURRENCY_SYMBOL}{campaign.dailyBudget.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Production Pipeline Tracker */}
                        <div className={`${campaign.metrics ? 'lg:col-span-3' : 'lg:col-span-5'} space-y-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-slate-400" />
                            <h4 className="text-[13px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_CAMPAIGNS_WORKFLOW_TITLE}</h4>
                          </div>
                          
                          <div className="relative w-full pb-8 mt-2 px-4">
                            {/* Linear Progress Bar Background */}
                            <div className="absolute top-[14px] left-4 right-4 h-1 bg-slate-100 rounded-full" />
                            
                            {/* Filled Progress Indicator */}
                            <div 
                              className="absolute top-[14px] left-4 h-1 bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `calc(${progressPercentage}% - 0px)` }} 
                            />

                            {/* Workflow Step Nodes */}
                            <div className="relative z-10 flex justify-between w-full">
                              {WORKFLOW_STAGES.map((stage, idx) => {
                                const isDone = idx < stageIndex;
                                const isActive = idx === stageIndex;

                                return (
                                  <div key={stage} className="flex flex-col items-center relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300 ${
                                      isDone ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 
                                      isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_0_5px_rgba(79,70,229,0.15)]' : 
                                      'bg-white border-slate-200 text-slate-300'
                                    }`}>
                                      {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                                    </div>
                                    
                                    {/* Step Label */}
                                    <div className="absolute top-10 w-20 text-center">
                                      <p className={`text-[10.5px] font-bold leading-tight tracking-tight ${
                                        isActive ? 'text-indigo-700' : isDone ? 'text-slate-600' : 'text-slate-400'
                                      }`}>
                                        {stage}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Performance Scorecard (Contextual) */}
                        {campaign.metrics && (
                          <div className="lg:col-span-2 grid grid-cols-2 gap-3 lg:border-l lg:border-slate-100 lg:pl-8">
                            <div className="col-span-2 flex items-center gap-2 mb-1">
                              <TrendingUp size={16} className="text-slate-400" />
                              <h4 className="text-[13px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_CAMPAIGNS_PERFORMANCE_TITLE}</h4>
                            </div>
                            
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                                <DollarSign size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{STATIC_STRINGS.CLIENT_CAMPAIGNS_METRIC_SPENT}</span>
                              </div>
                              <p className="text-[16px] font-bold text-slate-900 tabular-nums">{STATIC_STRINGS.CURRENCY_SYMBOL}{campaign.metrics.spend.toLocaleString()}</p>
                            </div>
                            
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                                <Users size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{STATIC_STRINGS.CLIENT_CAMPAIGNS_METRIC_LEADS}</span>
                              </div>
                              <p className="text-[16px] font-bold text-slate-900 tabular-nums">{campaign.metrics.leads.toLocaleString()}</p>
                            </div>
                            
                            <div className="col-span-2 bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-amber-600">
                                <Target size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{STATIC_STRINGS.CLIENT_CAMPAIGNS_METRIC_ROAS}</span>
                              </div>
                              <p className="text-[16px] font-bold text-slate-900 tabular-nums">{campaign.metrics.roas.toFixed(1)}×</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </article>
                );
              })
            )}
          </section>
        </main>
      </div>
    </AppLayout>
  );
}
