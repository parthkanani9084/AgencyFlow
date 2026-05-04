'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import Badge from '@/components/ui/Badge';
import { 
  Mail, 
  Briefcase, 
  Globe, 
  Video, 
  Target, 
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';

interface ClientProfile {
  name: string;
  email: string;
  packageAmount: number;
  planType: string;
  services: string[];
  platformType: string;
  websiteLink?: string;
  location?: string;
  reelsPerMonth: number;
  adType: string;
  perDaySpend: number;
}

const DEMO_PROFILE: ClientProfile = {
  name: 'Jordan Lee',
  email: 'jordan.lee@novabrew.com',
  packageAmount: 120000,
  planType: 'Monthly',
  services: ['reels', 'campaign', 'meta', 'social media'],
  platformType: 'Website',
  websiteLink: 'https://novabrew.com',
  reelsPerMonth: 12,
  adType: 'Lead Generation',
  perDaySpend: 1500,
};


export default function ClientProfilePage() {
  useRoleGuard([ROLES.CLIENT]);
  
  const [profile] = useState<ClientProfile>(DEMO_PROFILE);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto pb-12">
        <main className="space-y-6">
          
          {/* Identity & Status Header */}
          <header className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Subtle Aesthetic Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" aria-hidden="true" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-50 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                <span className="text-3xl font-bold text-violet-700 tracking-tight">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{profile.name}</h1>
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} /> {STATIC_STRINGS.CLIENT_PROFILE_ACTIVE}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="flex items-center gap-1.5 text-[13.5px] text-slate-500">
                    <Mail size={14} className="text-slate-400" />
                    {profile.email}
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1.5 text-[13.5px] text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-1 relative z-10 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.CLIENT_PROFILE_CURRENT_PLAN}</span>
              <Badge variant="review" label={`${profile.planType} ${STATIC_STRINGS.CLIENT_PROFILE_PLAN_SUFFIX}`} />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Details Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Financial Profile */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_PROFILE_FINANCIALS}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col justify-center">
                    <p className="text-[12.5px] font-medium text-slate-500 mb-1">{STATIC_STRINGS.CLIENT_PROFILE_TOTAL_PACKAGE}</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {STATIC_STRINGS.CURRENCY_SYMBOL}{profile.packageAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col justify-center">
                    <p className="text-[12.5px] font-medium text-slate-500 mb-1">{STATIC_STRINGS.CLIENT_PROFILE_DAILY_SPEND}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-900 tabular-nums">
                        {STATIC_STRINGS.CURRENCY_SYMBOL}{profile.perDaySpend.toLocaleString()}
                      </p>
                      <span className="text-[12px] font-medium text-slate-400">{STATIC_STRINGS.BUDGET_PER_DAY}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Strategic Overview */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_PROFILE_STRATEGY}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 mb-0.5">{STATIC_STRINGS.CLIENT_PROFILE_AD_TYPE}</p>
                      <p className="text-[14px] font-bold text-slate-800">{profile.adType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                      <Video size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-500 mb-0.5">{STATIC_STRINGS.CLIENT_PROFILE_CONTENT_QUOTA}</p>
                      <p className="text-[14px] font-bold text-slate-800">{profile.reelsPerMonth} {STATIC_STRINGS.CLIENT_PROFILE_REELS_SUFFIX}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Metadata */}
            <aside className="space-y-6">
              
              {/* Technical Platform Details */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_PROFILE_TARGET_PLATFORM}</h2>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <p className="text-[12px] font-medium text-slate-500 mb-1">{STATIC_STRINGS.CLIENT_PROFILE_PRIMARY_CHANNEL}</p>
                    <p className="text-[14px] font-semibold text-slate-900">{profile.platformType}</p>
                  </div>
                  
                  {profile.websiteLink && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[12px] font-medium text-slate-500 mb-1">{STATIC_STRINGS.CLIENT_PROFILE_WEBSITE}</p>
                      <a 
                        href={profile.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[13.5px] font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors block truncate"
                      >
                        {profile.websiteLink}
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* Ecosystem Subscription */}
              <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Briefcase size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">{STATIC_STRINGS.CLIENT_PROFILE_ACTIVE_SERVICES}</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <span 
                      key={service} 
                      className="px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 text-[11.5px] font-semibold capitalize border border-slate-200"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>

            </aside>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
