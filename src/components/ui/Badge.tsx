import React from 'react';

type BadgeVariant = 
  | 'active' | 'pending' | 'completed' | 'overdue' | 'draft' | 'paused' | 'review' | 'archived' 
  | 'meta' | 'google' | 'tiktok' | 'linkedin'
  | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border border-slate-200',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  overdue: 'bg-red-50 text-red-700 border border-red-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
  draft: 'bg-slate-100 text-slate-500 border border-slate-200',
  paused: 'bg-orange-50 text-orange-700 border border-orange-200',
  review: 'bg-blue-50 text-blue-700 border border-blue-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  archived: 'bg-slate-100 text-slate-400 border border-slate-200',
  meta: 'bg-blue-50 text-blue-700 border border-blue-200',
  google: 'bg-red-50 text-red-600 border border-red-200',
  tiktok: 'bg-slate-900 text-white border border-slate-800',
  linkedin: 'bg-sky-50 text-sky-700 border border-sky-200',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ variant, label, children, className = '', size = 'md' }: BadgeProps) {
  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-0.5 text-[11px]',
    lg: 'px-3 py-1 text-[13px]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold tracking-wide whitespace-nowrap transition-colors ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {children || label}
    </span>
  );
}