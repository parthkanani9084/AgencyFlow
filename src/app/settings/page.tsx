'use client';

import React, { useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Settings, User, Bell, Shield, Palette, Save, Camera,
  Mail, Lock, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';

// --- Types ---
type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',      label: 'Security',      icon: Lock },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
];

const NOTIF_SETTINGS = [
  { id: 'task_assigned',    label: 'Task Assigned',      desc: 'When a new task is assigned to you' },
  { id: 'task_completed',   label: 'Task Completed',     desc: 'When a task you created is completed' },
  { id: 'deadline_warning', label: 'Deadline Reminders', desc: '24h before a task deadline' },
  { id: 'campaign_update',  label: 'Campaign Updates',   desc: 'Status changes on active campaigns' },
  { id: 'handoff',          label: 'Workflow Handoffs',  desc: 'When content is passed to the next role' },
];

const ACCENT_COLORS = [
  { label: 'Violet', value: 'violet', cls: 'bg-violet-600' },
  { label: 'Blue',   value: 'blue',   cls: 'bg-blue-600' },
  { label: 'Teal',   value: 'teal',   cls: 'bg-teal-600' },
  { label: 'Rose',   value: 'rose',   cls: 'bg-rose-600' },
  { label: 'Amber',  value: 'amber',  cls: 'bg-amber-500' },
];


export default function SettingsPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager', 'Social Media Manager']);
  const { user } = useAuth();

  // -- State --
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: 'Marketing agency professional focused on delivering results.',
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
            Settings
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage your account preferences and configuration</p>
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
                Active Account
              </footer>
            </article>
          </aside>

          {/* Configuration Panels */}
          <section className="flex-1 min-w-0">
            
            {/* 1. Profile Panel */}
            {activeTab === 'profile' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">Profile Information</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Update your name, email, and bio</p>
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
                        Change Photo
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[12.5px] font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12.5px] font-bold text-slate-700">Email Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all resize-none font-medium"
                    />
                  </div>

                  <footer className="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <Shield size={15} className="text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-slate-800">Role: {user?.role}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Role modifications require administrative authorization</p>
                    </div>
                  </footer>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleProfileSave}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Notifications Panel */}
            {activeTab === 'notifications' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">Notification Preferences</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Manage events that trigger system notifications</p>
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
                    Update Preferences
                  </button>
                </footer>
              </article>
            )}

            {/* 3. Security Panel */}
            {activeTab === 'security' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">Account Security</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Manage authentication credentials</p>
                </header>
                <div className="px-6 py-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                        placeholder="Enter current password"
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
                    <label className="block text-[12.5px] font-bold text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm(f => ({ ...f, next: e.target.value }))}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12.5px] font-bold text-slate-700">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all font-medium"
                    />
                  </div>
                  <footer className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-800 font-medium">
                    Note: Password management is currently in evaluation mode. Integration with secure auth providers is required for production persistence.
                  </footer>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handlePasswordSave}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Lock size={14} />
                      Update Password
                    </button>
                  </div>
                </div>
              </article>
            )}

            {/* 4. Appearance Panel */}
            {activeTab === 'appearance' && (
              <article className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-bold text-slate-800">Appearance</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">Personalize your workspace visual theme</p>
                </header>
                <div className="px-6 py-5 space-y-7">
                  <section>
                    <p className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">Accent Color</p>
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
                    <p className="text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wider">Sidebar Style</p>
                    <div className="grid grid-cols-2 gap-4">
                      {['Compact', 'Expanded'].map((style) => (
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
                   custom color profiles will be available in the Enterprise edition.
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
