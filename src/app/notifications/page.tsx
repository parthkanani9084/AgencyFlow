'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertCircle, Megaphone, ArrowRight, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import { NotificationType } from '@/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { UserRole } from '@/types';
type FilterTab = 'all' | 'unread';

const TYPE_CONFIG: Record<NotificationType | string, { icon: React.ElementType; color: string; bg: string }> = {
  task_assigned:   { icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
  task_completed:  { icon: CheckCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  campaign_update: { icon: Megaphone,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  deadline_warning:{ icon: AlertCircle,  color: 'text-amber-600',  bg: 'bg-amber-50' },
  handoff:         { icon: ArrowRight,   color: 'text-purple-600', bg: 'bg-purple-50' },
  system:          { icon: Settings,     color: 'text-slate-500',  bg: 'bg-slate-100' },
  TASK_VERIFICATION: { icon: CheckCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const formatTimeAgo = (ts: string): string => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}${STATIC_STRINGS.NOTIFICATIONS_AGO_MINS}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${STATIC_STRINGS.NOTIFICATIONS_AGO_HRS}`;
  const days = Math.floor(hrs / 24);
  return `${days}${STATIC_STRINGS.NOTIFICATIONS_AGO_DAYS}`;
};


export default function NotificationsPage() {
  useRoleGuard(Object.values(ROLES) as unknown as UserRole[]);
  const { notifications, markNotifRead, clearNotifications } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
  [notifications]);

  const filteredNotifications = useMemo(() => 
    activeTab === 'unread' ? notifications.filter(n => !n.read) : notifications,
  [activeTab, notifications]);

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
  
    unreadIds.forEach(id => markNotifRead(id));
  }, [notifications, markNotifRead]);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;
    clearNotifications();

  }, [notifications.length, clearNotifications]);

  const handleDeleteNotification = (id: string) => {
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      
      <main className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        {/* Viewport Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-violet-600" />
              {STATIC_STRINGS.NOTIFICATIONS_TITLE}
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
              {unreadCount} {STATIC_STRINGS.NOTIFICATIONS_UNREAD.toLowerCase()} · {notifications.length} {STATIC_STRINGS.NOTIFICATIONS_TOTAL}
            </p>
          </div>
          
          <nav className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
              >
                <CheckCheck size={14} />
                {STATIC_STRINGS.NOTIFICATIONS_MARK_ALL_READ}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
              >
                <Trash2 size={14} />
                {STATIC_STRINGS.NOTIFICATIONS_CLEAR_ALL}
              </button>
            )}
          </nav>
        </header>

        {/* Tab Selection Filter */}
        <nav className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
          {(['all', 'unread'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all capitalize ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'unread' ? `${STATIC_STRINGS.NOTIFICATIONS_UNREAD} (${unreadCount})` : STATIC_STRINGS.NOTIFICATIONS_ALL}
            </button>
          ))}
        </nav>

        {/* Dynamic Notification List */}
        <section className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <article className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400">
              <Bell size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-[14px] font-medium italic">
                {activeTab === 'unread' ? STATIC_STRINGS.NOTIFICATIONS_NO_UNREAD : STATIC_STRINGS.NOTIFICATIONS_NO_NOTIFS}
              </p>
            </article>
          ) : (
            filteredNotifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
              const StatusIcon = cfg.icon;
              
              return (
                <article
                  key={notif.id}
                  className={`flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 transition-all hover:shadow-sm ${
                    !notif.read ? 'border-violet-200 bg-violet-50/20' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <StatusIcon size={16} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <header className="flex items-start justify-between gap-2">
                      <p className={`text-[13.5px] font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                        {!notif.read && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-violet-500 align-middle animate-pulse" />
                        )}
                      </p>
                      <time className="text-[11px] text-slate-400 whitespace-nowrap font-medium flex-shrink-0">
                        {formatTimeAgo(notif.timestamp)}
                      </time>
                    </header>
                    <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.actor && (
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{STATIC_STRINGS.NOTIFICATIONS_BY} {notif.actor}</p>
                    )}
                  </div>

                  <footer className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {!notif.read && (
                      <button
                        onClick={() => markNotifRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-colors"
                        title={STATIC_STRINGS.NOTIFICATIONS_MARK_AS_READ}
                      >
                        <CheckCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title={STATIC_STRINGS.NOTIFICATIONS_DELETE}
                    >
                      <Trash2 size={13} />
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>
      </main>
    </AppLayout>
  );
}
