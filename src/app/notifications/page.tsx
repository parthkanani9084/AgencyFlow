'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertCircle, Megaphone, ArrowRight, Settings } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import type { Notification, NotificationType } from '@/lib/types';
import Icon from '@/components/ui/AppIcon';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useTasks } from '@/context/TaskContext';


// ─── Mock data ────────────────────────────────────────────────────────────────
const initialNotifications: Notification[] = [
  { id: 'n1',  type: 'task_assigned',   title: 'New task assigned',          message: 'You have been assigned "Shoot product photos for NovaBrew launch".',         timestamp: '2026-04-17T14:30:00', read: false, actor: 'Alex Owens',   targetId: 't1', targetType: 'task' },
  { id: 'n2',  type: 'handoff',         title: 'Task handed off to you',     message: 'Marco Reyes completed shooting for PulseWear Q2 Reel. Ready for editing.',   timestamp: '2026-04-17T12:15:00', read: false, actor: 'Marco Reyes',  targetId: 't2', targetType: 'task' },
  { id: 'n3',  type: 'deadline_warning',title: 'Deadline approaching',       message: '"Edit raw footage for PulseWear reel" is due in 1 day.',                      timestamp: '2026-04-17T09:00:00', read: false, actor: undefined,      targetId: 't2', targetType: 'task' },
  { id: 'n4',  type: 'task_completed',  title: 'Task completed',             message: 'Sofia Nguyen completed "Launch Google Ads for PulseWear".',                   timestamp: '2026-04-16T17:45:00', read: true,  actor: 'Sofia Nguyen', targetId: 't6', targetType: 'task' },
  { id: 'n5',  type: 'campaign_update', title: 'Campaign status updated',    message: 'NovaBrew Spring Launch moved to Editing stage.',                              timestamp: '2026-04-16T15:20:00', read: true,  actor: 'Alex Owens',   targetId: 'c1', targetType: 'campaign' },
  { id: 'n6',  type: 'task_assigned',   title: 'New task assigned',          message: 'You have been assigned "Run Meta ads for GreenRoot campaign".',               timestamp: '2026-04-15T11:00:00', read: true,  actor: 'Priya Sharma', targetId: 't3', targetType: 'task' },
  { id: 'n7',  type: 'deadline_warning',title: 'Overdue task alert',         message: '"Shoot event coverage for GreenRoot" is 5 days overdue.',                    timestamp: '2026-04-14T08:00:00', read: true,  actor: undefined,      targetId: 't7', targetType: 'task' },
  { id: 'n8',  type: 'system',          title: 'Welcome to AgencyFlow',      message: 'Your workspace is set up. Start by creating a campaign or adding a client.', timestamp: '2026-01-10T10:00:00', read: true,  actor: undefined },
];

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  task_assigned:   { icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
  task_completed:  { icon: CheckCheck,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  campaign_update: { icon: Megaphone,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  deadline_warning:{ icon: AlertCircle,  color: 'text-amber-600',  bg: 'bg-amber-50' },
  handoff:         { icon: ArrowRight,   color: 'text-purple-600', bg: 'bg-purple-50' },
  system:          { icon: Settings,     color: 'text-slate-500',  bg: 'bg-slate-100' },
};

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

export default function NotificationsPage() {
  useRoleGuard(['Owner', 'Manager', 'Shooter', 'Editor', 'Ads Manager']);
  const { notifications, markNotifRead, clearNotifications } = useTasks();
  const [tab, setTab] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = tab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  function markRead(id: string) {
    markNotifRead(id);
  }

  function markAllRead() {
    notifications.forEach(n => {
      if (!n.read) markNotifRead(n.id);
    });
    toast.success('All notifications marked as read');
  }

  function deleteNotification(id: string) {
    // Note: delete individual notif not implemented in context yet, 
    // but markRead is enough for now or we can just leave it.
    toast.info('Delete feature coming soon');
  }

  function clearAll() {
    clearNotifications();
    toast.success('All notifications cleared');
  }

  return (
    <AppLayout>
      <Toaster position="bottom-right" richColors />
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">

        {/* Header */}
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
            <p className="text-[13px] text-slate-500 mt-0.5">
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-violet-600 hover:text-violet-700 border border-violet-200 hover:border-violet-300 px-3 py-2 rounded-lg transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
          {(['all', 'unread'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors capitalize ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'unread' ? `Unread (${unreadCount})` : 'All'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {displayed.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl py-16 text-center text-slate-400">
              <Bell size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-[14px] font-medium">
                {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            displayed.map((notif) => {
              const cfg = typeConfig[notif.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 bg-white border rounded-xl px-4 py-3.5 transition-colors ${
                    !notif.read ? 'border-violet-200 bg-violet-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13.5px] font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {notif.title}
                        {!notif.read && (
                          <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-violet-500 align-middle" />
                        )}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                    {notif.actor && (
                      <p className="text-[11px] text-slate-400 mt-1">by {notif.actor}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
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
