'use client';

import React from 'react';
import { LucideIcon, Zap, BarChart3, Users, Shield } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { STATIC_STRINGS } from '@/utils/constants';

const FEATURES = [
  { icon: Zap, text: STATIC_STRINGS.LOGIN_FEATURE_PIPELINE },
  { icon: BarChart3, text: STATIC_STRINGS.LOGIN_FEATURE_ADS },
  { icon: Users, text: STATIC_STRINGS.LOGIN_FEATURE_SCALE },
  { icon: Shield, text: STATIC_STRINGS.LOGIN_FEATURE_ROLES },
];

const STATS = [
  { value: STATIC_STRINGS.LOGIN_STAT_CLIENTS_VAL, label: STATIC_STRINGS.LOGIN_STAT_CLIENTS },
  { value: STATIC_STRINGS.LOGIN_STAT_TASKS_VAL, label: STATIC_STRINGS.LOGIN_STAT_TASKS },
  { value: STATIC_STRINGS.LOGIN_STAT_ROAS_VAL, label: STATIC_STRINGS.LOGIN_STAT_ROAS },
];

const FeatureItem = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={14} className="text-violet-400" />
    </div>
    <p className="text-slate-400 text-[13px] leading-snug">{text}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
    <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
  </div>
);

export default function LoginSidebar() {
  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col bg-gradient-to-br from-[#0F0A1E] via-[#1A0F3C] to-[#2D1B69] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <AppLogo size={36} />
          <span className="text-white font-semibold text-xl tracking-tight">
            {STATIC_STRINGS.LOGIN_PLATFORM_NAME}
          </span>
        </div>

        <div className="mt-16 xl:mt-20">
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-[12px] font-medium">
              {STATIC_STRINGS.LOGIN_SUBTITLE_PLATFORM}
            </span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            {STATIC_STRINGS.LOGIN_HERO_TITLE_PART1}
            <br />
            <span className="text-violet-400">{STATIC_STRINGS.LOGIN_HERO_TITLE_PART2}</span>
          </h1>
          <p className="mt-4 text-slate-400 text-[14.5px] leading-relaxed max-w-sm">
            {STATIC_STRINGS.LOGIN_HERO_DESC}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {FEATURES.map((feature, idx) => (
            <FeatureItem key={idx} icon={feature.icon} text={feature.text} />
          ))}
        </div>

        <div className="mt-auto pt-10">
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {STATS.map((stat, idx) => (
              <StatItem key={idx} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
