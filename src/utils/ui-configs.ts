import { 
  Camera, Film, Megaphone, TrendingUp, User, 
  Circle, Timer, CheckCircle2, Crown, UserCheck
} from 'lucide-react';
import { ROLES, STATIC_STRINGS } from './constants';
import React from 'react';

export const UI_PALETTE = {
  PRIMARY: 'bg-violet-50 text-violet-700 border-violet-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WARNING: 'bg-orange-50 text-orange-700 border-orange-200',
  DANGER: 'bg-rose-50 text-rose-700 border-rose-200',
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
  NEUTRAL: 'bg-slate-100 text-slate-500 border-slate-200',
  SKY: 'bg-sky-50 text-sky-700 border-sky-200',
  PINK: 'bg-pink-50 text-pink-700 border-pink-200',
  TEAL: 'bg-teal-50 text-teal-700 border-teal-200',
  DARK: 'bg-slate-800 text-white border-slate-900',
} as const;

export const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
} as const;

export const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  [ROLES.SUPER_ADMIN]: { color: 'text-violet-700', bg: 'bg-violet-100', icon: Crown },
  [ROLES.OWNER]:        { color: 'text-violet-700', bg: 'bg-violet-100', icon: Crown },
  [ROLES.MANAGER]:      { color: 'text-teal-700',   bg: 'bg-teal-100',   icon: UserCheck },
  [ROLES.SHOOTER]:      { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Camera },
  [ROLES.EDITOR]:       { color: 'text-purple-700', bg: 'bg-purple-100', icon: Film },
  [ROLES.ADS_MANAGER]:{ color: 'text-orange-700', bg: 'bg-orange-100', icon: Megaphone },
  [ROLES.SOCIAL_MEDIA_MANAGER]: { color: 'text-pink-600', bg: 'bg-pink-50', icon: TrendingUp },
  [ROLES.CLIENT]:       { color: 'text-indigo-700', bg: 'bg-indigo-100', icon: UserCheck },
};

export const ROLE_AVATAR_COLORS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: 'bg-violet-600',
  [ROLES.OWNER]:        'bg-violet-600',
  [ROLES.MANAGER]:      'bg-teal-600',
  [ROLES.SHOOTER]:      'bg-blue-600',
  [ROLES.EDITOR]:       'bg-purple-600',
  [ROLES.ADS_MANAGER]:'bg-orange-600',
  [ROLES.SOCIAL_MEDIA_MANAGER]: 'bg-pink-600',
  [ROLES.CLIENT]:      'bg-indigo-600',
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { 
    label: STATIC_STRINGS.TASK_MGMT_PENDING, 
    color: 'text-slate-600', 
    bg: 'bg-slate-100', 
    icon: Circle 
  },
  in_progress: { 
    label: STATIC_STRINGS.TASK_MGMT_IN_PROGRESS, 
    color: 'text-amber-700', 
    bg: 'bg-amber-100', 
    icon: Timer 
  },
  completed: { 
    label: STATIC_STRINGS.TASK_MGMT_COMPLETED, 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-100', 
    icon: CheckCircle2 
  },
};

export const REEL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  schedule: { 
    label: STATIC_STRINGS.SMM_TAB_SCHEDULED, 
    color: 'text-slate-600', 
    bg: 'bg-slate-100', 
    icon: Circle 
  },
  production: { 
    label: STATIC_STRINGS.SMM_TAB_PRODUCTION, 
    color: 'text-amber-700', 
    bg: 'bg-amber-100', 
    icon: Timer 
  },
  uploaded: { 
    label: STATIC_STRINGS.SMM_TAB_UPLOADED, 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-100', 
    icon: CheckCircle2 
  },
};

export const CAMPAIGN_STATUS_STYLES: Record<string, string> = {
  [STATIC_STRINGS.ADS_STATUS_ACTIVE]: UI_PALETTE.SUCCESS,
  [STATIC_STRINGS.ADS_STATUS_DRAFT]: UI_PALETTE.NEUTRAL,
  [STATIC_STRINGS.ADS_STATUS_PAUSED]: UI_PALETTE.WARNING,
  [STATIC_STRINGS.ADS_STATUS_COMPLETED]: UI_PALETTE.INFO,
  [STATIC_STRINGS.ADS_STATUS_ARCHIVED]: UI_PALETTE.NEUTRAL,
};


export const CAMPAIGN_STAGE_STYLES: Record<string, string> = {
  'in draft': UI_PALETTE.NEUTRAL,
  'in review': UI_PALETTE.SKY,
  'process': UI_PALETTE.PRIMARY,
  'publish': UI_PALETTE.SUCCESS,
};



export const PLATFORM_STYLES: Record<string, string> = {
  Meta: 'bg-blue-50 text-blue-700 border border-blue-100',
  Facebook: 'bg-blue-50 text-blue-700 border border-blue-100',
  Instagram: 'bg-pink-50 text-pink-700 border border-pink-100 px-2.5',
  Google: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  TikTok: 'bg-pink-50 text-pink-700 border border-pink-100 px-2.5',
  LinkedIn: UI_PALETTE.SKY,
  Multi: UI_PALETTE.PRIMARY,
};

export const PLATFORM_BRAND_COLORS: Record<string, string> = {
  Meta: '#1877f2',
  Google: '#10b981', 
  Instagram: '#e1306c',
  TikTok: '#0f172a', 
  Multi: '#7c3aed', 
};


