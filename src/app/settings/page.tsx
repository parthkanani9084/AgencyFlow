'use client';

import React, { useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Settings, User, Bell, Shield, Palette, Save, Camera,
  Mail, Lock, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { STATIC_STRINGS, PAGE_ROLES, ROLES } from '@/utils/constants';
import { UserRole } from '@/types';

// --- Types ---
type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';
 
interface ProfileForm {
  name: string;
  email: string;
  bio: string;
}

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'profile',       label: STATIC_STRINGS.SETTINGS_TAB_PROFILE,       icon: User },
  { id: 'notifications', label: STATIC_STRINGS.SETTINGS_TAB_NOTIFICATIONS, icon: Bell },
  { id: 'security',      label: STATIC_STRINGS.SETTINGS_TAB_SECURITY,      icon: Lock },
  { id: 'appearance',    label: STATIC_STRINGS.SETTINGS_TAB_APPEARANCE,    icon: Palette },
];

const NOTIF_SETTINGS = [
  { id: 'task_assigned',    label: STATIC_STRINGS.SETTINGS_NOTIF_TASK_ASSIGNED,      desc: STATIC_STRINGS.SETTINGS_NOTIF_TASK_ASSIGNED_DESC },
  { id: 'task_completed',   label: STATIC_STRINGS.SETTINGS_NOTIF_TASK_COMPLETED,     desc: STATIC_STRINGS.SETTINGS_NOTIF_TASK_COMPLETED_DESC },
  { id: 'deadline_warning', label: STATIC_STRINGS.SETTINGS_NOTIF_DEADLINE,           desc: STATIC_STRINGS.SETTINGS_NOTIF_DEADLINE_DESC },
  { id: 'campaign_update',  label: STATIC_STRINGS.SETTINGS_NOTIF_CAMPAIGN,           desc: STATIC_STRINGS.SETTINGS_NOTIF_CAMPAIGN_DESC },
  { id: 'handoff',          label: STATIC_STRINGS.SETTINGS_NOTIF_HANDOFF,            desc: STATIC_STRINGS.SETTINGS_NOTIF_HANDOFF_DESC },
];

const ACCENT_COLORS = [
  { label: STATIC_STRINGS.COLOR_VIOLET, value: 'violet', cls: 'bg-violet-600' },
  { label: STATIC_STRINGS.COLOR_BLUE,   value: 'blue',   cls: 'bg-blue-600' },
  { label: STATIC_STRINGS.COLOR_TEAL,   value: 'teal',   cls: 'bg-teal-600' },
  { label: STATIC_STRINGS.COLOR_ROSE,   value: 'rose',   cls: 'bg-rose-600' },
  { label: STATIC_STRINGS.COLOR_AMBER,  value: 'amber',  cls: 'bg-amber-500' },
];


export default function SettingsPage() {
  useRoleGuard(Object.values(ROLES) as unknown as UserRole[]);
  const { user } = useAuth();

  // -- State --
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: STATIC_STRINGS.SETTINGS_BIO_DEFAULT,
  });
  const [notifEnabled, setNotifEnabled] = useState<Record<string, boolean>>({
    task_assigned: true,
    task_completed: true,
    deadline_warning: true,
    campaign_update: false,
    handoff: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [selectedAccent, setSelectedAccent] = useState('violet');

  // -- Handlers --
  const handleProfileSave = useCallback(() => {
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    toast.success('Profile updated successfully');
  }, [profileForm.name]);

  const handlePasswordSave = useCallback(() => {
    if (!passwordForm.current) {
      toast.error('Enter your current password');
      return;
    }
    if (passwordForm.next.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordForm({ current: '', next: '', confirm: '' });
  }, [passwordForm]);

  const toggleNotification = (id: string) => {
    setNotifEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      
      <main className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-lg mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings size={20} className="text-violet-600" />
            {STATIC_STRINGS.SETTINGS_TITLE}
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">{STATIC_STRINGS.SETTINGS_SUBTITLE}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-52 flex-shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm sticky top-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold transition-all border-b border-slate-100 last:border-0 ${
                      isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-violet-600' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick Profile Summary */}
            <article className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <header className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold shadow-sm">
                  {user?.avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{user?.role}</p>
                </div>
              </header>
              <footer className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                <CheckCircle2 size={11} />
                {STATIC_STRINGS.SETTINGS_ACTIVE_ACCOUNT}
              </footer>
            </article>
          </aside>

          {/* Configuration Panels */}
          <section className="flex-1 min-w-0">
            
            {/* 1. Profile Panel */}
            {activeTab === 'profile' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">{STATIC_STRINGS.SETTINGS_PROFILE_INFO}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{STATIC_STRINGS.SETTINGS_PROFILE_SUBTITLE}</p>
                </header>
                <div className="px-6 py-5 space-y-5">
                  {/* Photo Management */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-white text-xl font-bold shadow-lg">
                      {user?.avatarInitials}
                    </div>
                    <div>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]">
                        <Camera size={13} />
                        {STATIC_STRINGS.SETTINGS_CHANGE_PHOTO}
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">{STATIC_STRINGS.SETTINGS_PHOTO_REQUIREMENTS}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_FULL_NAME}</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfileForm(f => ({ ...f, name: val }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_EMAIL_ADDR}</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => {
                             const val = e.target.value;
                             setProfileForm(f => ({ ...f, email: val }));
                           }}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_BIO}</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileForm(f => ({ ...f, bio: val }));
                      }}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none font-medium"
                    />
                  </div>

                  <footer className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <Shield size={15} className="text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-slate-800">{STATIC_STRINGS.SETTINGS_ROLE_LABEL} {user?.role}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{STATIC_STRINGS.SETTINGS_ROLE_AUTH_NOTICE}</p>
                    </div>
                  </footer>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleProfileSave}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Save size={14} />
                      {STATIC_STRINGS.SETTINGS_SAVE_CHANGES}
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Notifications Panel */}
            {activeTab === 'notifications' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">{STATIC_STRINGS.SETTINGS_NOTIF_PREFS}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{STATIC_STRINGS.SETTINGS_NOTIF_SUBTITLE}</p>
                </header>
                <div className="divide-y divide-slate-50">
                  {NOTIF_SETTINGS.map((n) => (
                    <div key={n.id} className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/30 transition-colors">
                      <div className="pr-4">
                        <p className="text-[13px] font-bold text-slate-800">{n.label}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{n.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(n.id)}
                        className={`relative w-10 h-5.5 rounded-full transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${notifEnabled[n.id] ? 'bg-violet-600' : 'bg-slate-200'}`}
                      >
                        <span
                          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all ${notifEnabled[n.id] ? 'left-[20px]' : 'left-[2px]'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <footer className="px-6 py-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => toast.success('Notification preferences updated')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Save size={14} />
                    {STATIC_STRINGS.SETTINGS_UPDATE_PREFS}
                  </button>
                </footer>
              </article>
            )}

            {/* 3. Security Panel */}
            {activeTab === 'security' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">{STATIC_STRINGS.SETTINGS_ACCOUNT_SECURITY}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{STATIC_STRINGS.SETTINGS_SECURITY_SUBTITLE}</p>
                </header>
                <div className="px-6 py-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_CURRENT_PWD}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                        placeholder={STATIC_STRINGS.SETTINGS_CURRENT_PWD_PLACEHOLDER}
                        className="w-full px-3.5 pr-10 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_NEW_PWD}</label>
                    <input
                      type="password"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm(f => ({ ...f, next: e.target.value }))}
                      placeholder={STATIC_STRINGS.SETTINGS_NEW_PWD_PLACEHOLDER}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">{STATIC_STRINGS.SETTINGS_CONFIRM_PWD}</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder={STATIC_STRINGS.SETTINGS_CONFIRM_PWD_PLACEHOLDER}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                    />
                  </div>
                  <footer className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-800 font-medium">
                    {STATIC_STRINGS.SETTINGS_SECURITY_NOTICE}
                  </footer>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handlePasswordSave}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Lock size={14} />
                      {STATIC_STRINGS.SETTINGS_UPDATE_PWD}
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* 4. Appearance Panel */}
            {activeTab === 'appearance' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">{STATIC_STRINGS.SETTINGS_TAB_APPEARANCE}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{STATIC_STRINGS.SETTINGS_APPEARANCE_SUBTITLE}</p>
                </header>
                <div className="px-6 py-5 space-y-7">
                  <section>
                    <p className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">{STATIC_STRINGS.SETTINGS_ACCENT_COLOR}</p>
                    <div className="flex flex-wrap gap-4">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => { setSelectedAccent(c.value); toast.success(`${c.label} accent applied`); }}
                          className={`w-10 h-10 rounded-full ${c.cls} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm ${selectedAccent === c.value ? 'ring-2 ring-offset-2 ring-slate-300 scale-110 shadow-md' : ''}`}
                          title={c.label}
                        >
                          {selectedAccent === c.value && <CheckCircle2 size={18} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <p className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">{STATIC_STRINGS.SETTINGS_SIDEBAR_STYLE}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[STATIC_STRINGS.SIDEBAR_COMPACT, STATIC_STRINGS.SIDEBAR_EXPANDED].map((style) => (
                        <button
                          key={style}
                          onClick={() => toast.info(`${style} mode coming in next update`)}
                          className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300 active:scale-[0.98]"
                        >
                          <Palette size={15} className="text-slate-400" />
                          {style}
                        </button>
                      ))}
                    </div>
                  </section>

                  <footer className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] text-slate-500 font-medium">
                    {STATIC_STRINGS.SETTINGS_APPEARANCE_NOTICE}
                  </footer>
                </div>
              </article>
            )}
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
