'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Settings, User, Bell, Shield, Palette, Save, Camera,
  Mail, Lock, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';


type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',      label: 'Security',      icon: Lock },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
];

const notifSettings = [
  { id: 'task_assigned',    label: 'Task Assigned',      desc: 'When a new task is assigned to you' },
  { id: 'task_completed',   label: 'Task Completed',     desc: 'When a task you created is completed' },
  { id: 'deadline_warning', label: 'Deadline Reminders', desc: '24h before a task deadline' },
  { id: 'campaign_update',  label: 'Campaign Updates',   desc: 'Status changes on active campaigns' },
  { id: 'handoff',          label: 'Workflow Handoffs',  desc: 'When content is passed to the next role' },
];

const accentColors = [
  { label: 'Violet', value: 'violet', cls: 'bg-violet-600' },
  { label: 'Blue',   value: 'blue',   cls: 'bg-blue-600' },
  { label: 'Teal',   value: 'teal',   cls: 'bg-teal-600' },
  { label: 'Rose',   value: 'rose',   cls: 'bg-rose-600' },
  { label: 'Amber',  value: 'amber',  cls: 'bg-amber-500' },
];

export default function SettingsPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  const { user } = useAuth();

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

  function handleProfileSave() {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    toast.success('Profile updated');
  }

  function handlePasswordSave() {
    if (!passwordForm.current) { toast.error('Enter your current password'); return; }
    if (passwordForm.next.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwordForm.next !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password changed');
    setPasswordForm({ current: '', next: '', confirm: '' });
  }

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-lg mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings size={20} className="text-violet-600" />
            Settings
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage your account preferences and configuration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-52 flex-shrink-0">
            <nav className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-colors border-b border-slate-100 last:border-0 ${
                      activeTab === tab.id
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={15} className={activeTab === tab.id ? 'text-violet-600' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Role Info Card */}
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-bold text-white">{user?.avatarInitials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 size={11} />
                Account active
              </div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex-1 min-w-0">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-semibold text-slate-800">Profile Information</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Update your name, email, and bio</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">{user?.avatarInitials}</span>
                    </div>
                    <div>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Camera size={13} />
                        Change Photo
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Shield size={14} className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-700">Role: {user?.role}</p>
                      <p className="text-[11px] text-slate-400">Role changes must be made by the Owner</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleProfileSave}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-semibold text-slate-800">Notification Preferences</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Choose which events trigger in-app notifications</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifSettings.map((n) => (
                    <div key={n.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{n.label}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">{n.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifEnabled((prev) => ({ ...prev, [n.id]: !prev[n.id] }))}
                        className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${notifEnabled[n.id] ? 'bg-violet-600' : 'bg-slate-200'}`}
                        style={{ height: 22, width: 40 }}
                      >
                        <span
                          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${notifEnabled[n.id] ? 'translate-x-5' : 'translate-x-0.5'}`}
                          style={{ width: 18, height: 18, top: 2, left: notifEnabled[n.id] ? 20 : 2, position: 'absolute', transition: 'left 0.15s' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => toast.success('Notification preferences saved')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors"
                  >
                    <Save size={14} />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-semibold text-slate-800">Security</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Manage your password and account security</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-3.5 pr-10 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700">
                    Password changes require backend auth integration to persist. This is a UI prototype.
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordSave}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-colors"
                    >
                      <Lock size={14} />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="text-[14px] font-semibold text-slate-800">Appearance</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">Customize the look and feel of your workspace</p>
                </div>
                <div className="px-6 py-5 space-y-6">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-700 mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {accentColors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => { setSelectedAccent(c.value); toast.success(`Accent set to ${c.label}`); }}
                          className={`w-9 h-9 rounded-full ${c.cls} flex items-center justify-center transition-transform hover:scale-110 ${selectedAccent === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                          title={c.label}
                        >
                          {selectedAccent === c.value && <CheckCircle2 size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-slate-700 mb-3">Sidebar Style</p>
                    <div className="grid grid-cols-2 gap-3">
                      {['Compact', 'Expanded'].map((style) => (
                        <button
                          key={style}
                          onClick={() => toast.info(`${style} sidebar coming soon`)}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Palette size={14} className="text-slate-400" />
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-[12px] text-slate-500">
                    Full theme customization will be available after backend integration.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
