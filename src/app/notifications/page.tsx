'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertCircle, Megaphone, ArrowRight, Settings } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Notification, NotificationType } from '@/types';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';

/**
 * UI Configuration for different notification types
 */
const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  task_assigned:   { icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
  task_completed:  { icon: CheckCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  campaign_update: { icon: Megaphone,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  deadline_warning:{ icon: AlertCircle,  color: 'text-amber-600',  bg: 'bg-amber-50' },
  handoff:         { icon: ArrowRight,   color: 'text-purple-600', bg: 'bg-purple-50' },
  system:          { icon: Settings,     color: 'text-slate-500',  bg: 'bg-slate-100' },
  TASK_VERIFICATION: { icon: CheckCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

/**
 * Formats a timestamp into a human-readable relative time string.
 */
function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type FilterTab = 'all' | 'unread';

/**
 * Notifications Dashboard
 * Refactored for simplicity, flat logic, and strict global typing.
 */
export default function NotificationsPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  const { notifications, markNotifRead, clearNotifications } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Derived State
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  // 2. Handlers
  const handleMarkAllRead = () => {
    const unread = notifications.filter(n => !n.read);
    unread.forEach(n => markNotifRead(n.id));
    if (unread.length > 0) {
      toast.success('All notifications marked as read');
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    clearNotifications();
    toast.success('All notifications cleared');
  };

  const handleDeleteNotification = (id: string) => {
    // Note: Individual deletion logic not yet in global context, 
    // marking as read is the current primary interaction.
    toast.info('Individual deletion coming soon');
  };

  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-violet-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5 font-medium">
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors bg-white shadow-sm"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
          {(['all', 'unread'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all capitalize ${
                activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'unread' ? `Unread (${unreadCount})` : 'All'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400">
              <Bell size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-[14px] font-medium italic">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
              const StatusIcon = cfg.icon;
              
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 transition-all hover:shadow-sm ${
                    !notif.read ? 'border-violet-200 bg-violet-50/20' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Type Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <StatusIcon size={16} className={cfg.color} />
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13.5px] font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                        {!notif.read && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-violet-500 align-middle animate-pulse" />
                        )}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium flex-shrink-0">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                    {notif.actor && (
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">By {notif.actor}</p>
                    )}
                  </div>

                  {/* Individual Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {!notif.read && (
                      <button
                        onClick={() => markNotifRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
