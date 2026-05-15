'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  TrendingUp,
  Camera,
  Film,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { useGetUnreadNotificationsCount } from '@/api/hooks/useNotification';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { STATIC_STRINGS } from '@/utils/constants';
import LogoutModal from '@/components/LogoutModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  group: string;
  allowedRoles: UserRole[];
}

const groups = [
  { id: 'main',      label: 'Workspace' },
  { id: 'roles',     label: 'Role Dashboards' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings',  label: 'Account' },
];

export default function Sidebar() {
  const { data: unreadNotificationsData } = useGetUnreadNotificationsCount({ 
    staleTime: 1000 * 60 * 1, 
    refetchOnWindowFocus: false 
  });
  
  const unreadCount = (unreadNotificationsData as any)?.results?.unread_count || 0;
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };


  const navItems: NavItem[] = [
    // Workspace
    { id: 'nav-dashboard',     label: 'Dashboard',     icon: LayoutDashboard, href: ROUTES.OWNER_DASHBOARD,             group: 'main',      allowedRoles: [ROLES.OWNER] },
    { id: 'nav-client-profile', label: 'My Profile',    icon: Users,           href: ROUTES.CLIENT_PROFILE,       group: 'main',      allowedRoles: [ROLES.CLIENT] },
    { id: 'nav-client-campaigns', label: 'My Campaigns', icon: Megaphone,      href: ROUTES.CLIENT_CAMPAIGNS,     group: 'main',      allowedRoles: [ROLES.CLIENT] },
    { id: 'nav-client-reels',     label: 'My Reels',        icon: Film,            href: ROUTES.CLIENT_REELS,         group: 'main',      allowedRoles: [ROLES.CLIENT] },
    { id: 'nav-campaigns',     label: 'Campaigns',     icon: Megaphone,       href: ROUTES.CAMPAIGN_MANAGEMENT,   group: 'main', allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
    { id: 'nav-clients',       label: 'Clients',       icon: Briefcase,       href: ROUTES.CLIENT_MANAGEMENT,     group: 'main',      allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
    { id: 'nav-tasks',         label: 'Tasks',         icon: CheckSquare,     href: ROUTES.TASK_MANAGEMENT,       group: 'main', allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
    { id: 'nav-sa-dashboard',  label: 'Dashboard',      icon: LayoutDashboard, href: ROUTES.SUPER_ADMIN_DASHBOARD,  group: 'main',      allowedRoles: [ROLES.SUPER_ADMIN] },
    { id: 'nav-sa-agencies',   label: 'Business Agency', icon: Briefcase,       href: ROUTES.SUPER_ADMIN_AGENCIES, group: 'main',      allowedRoles: [ROLES.SUPER_ADMIN] },
    { id: 'nav-sa-subs',       label: 'Subscription',    icon: Megaphone,       href: ROUTES.SUPER_ADMIN_SUBSCRIPTIONS, group: 'main',      allowedRoles: [ROLES.SUPER_ADMIN] },

    // Role Dashboards
    { id: 'nav-manager',       label: 'Manager',       icon: UserCheck,       href: ROUTES.MANAGER_DASHBOARD,     group: 'roles',     allowedRoles: [ROLES.OWNER, ROLES.MANAGER] },
    { id: 'nav-shooter',       label: 'Shooter',       icon: Camera,          href: ROUTES.SHOOTER_DASHBOARD,     group: 'roles',     allowedRoles: [ROLES.OWNER, ROLES.SHOOTER, ROLES.MANAGER] },
    { id: 'nav-editor',        label: 'Editor',        icon: Film,            href: ROUTES.EDITOR_DASHBOARD,      group: 'roles',     allowedRoles: [ROLES.OWNER, ROLES.EDITOR, ROLES.MANAGER] },
    { id: 'nav-ads-mgr',       label: 'Ads Manager',   icon: Megaphone,       href: ROUTES.ADS_MANAGER_DASHBOARD, group: 'roles',     allowedRoles: [ROLES.OWNER, ROLES.ADS_MANAGER, ROLES.MANAGER] },
    { id: 'nav-social-mgr',    label: 'Social Media',  icon: TrendingUp,      href: ROUTES.SOCIAL_MEDIA_MANAGER_DASHBOARD, group: 'roles', allowedRoles: [ROLES.OWNER, ROLES.SOCIAL_MEDIA_MANAGER, ROLES.MANAGER] },

    // Analytics
    // { id: 'nav-ads',           label: 'Ads Tracking',  icon: TrendingUp,      href: ROUTES.ADS_TRACKING,          group: 'analytics', allowedRoles: [ROLES.OWNER, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER, ROLES.MANAGER] },
    // { id: 'nav-reports',       label: 'Reports',       icon: BarChart3,       href: ROUTES.REPORTS,               group: 'analytics', allowedRoles: [ROLES.OWNER, ROLES.MANAGER] },

    // Account
    { id: 'nav-team',          label: 'Team',          icon: Users,           href: ROUTES.TEAM,                  group: 'settings',  allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
    { id: 'nav-notifications', label: 'Notifications', icon: Bell,            href: ROUTES.NOTIFICATIONS,         badge: unreadCount > 0 ? unreadCount : undefined, group: 'settings', allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
    // { id: 'nav-settings',      label: 'Settings',      icon: Settings,        href: ROUTES.SETTINGS,              group: 'settings',  allowedRoles: [ROLES.OWNER, ROLES.MANAGER, ROLES.SHOOTER, ROLES.EDITOR, ROLES.ADS_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER] },
  ];

  // Filter nav items to only those the current user's role can access
  const visibleItems = user
    ? navItems.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  return (
    <aside
      className={`relative flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-slate-200 ${collapsed ? 'justify-center px-0' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-semibold text-[15px] text-slate-900 tracking-tight whitespace-nowrap">
            {STATIC_STRINGS.TITLE}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {groups.map((group) => {
          const items = visibleItems.filter((i) => i.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={`group-${group.id}`} className="mb-4">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-600 uppercase tracking-widest text-slate-400">
                  {group.label}
                </p>
              )}
              {items.map((item) => {
                const NavIcon = item.icon;
                const active =
                  item.id === 'nav-dashboard'
                    ? pathname === ROUTES.OWNER_DASHBOARD
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 mb-0.5 ${
                      active
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${collapsed ? 'justify-center px-0 mx-1' : ''}`}
                  >
                    <NavIcon
                      size={17}
                      className={`flex-shrink-0 transition-colors ${
                        active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!collapsed && (
                      <span key={`label-${item.id}`} className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[10px] font-600 bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 leading-none tabular-nums">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
                    )}
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-slate-200 p-2">
        {!collapsed && user && (
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer mb-1 transition-colors"
            onClick={() => setShowLogoutModal(true)}
            title="Sign out"
          >

            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-semibold text-white">{user.avatarInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.role}</p>
            </div>
            <LogOut size={14} className="text-slate-400 flex-shrink-0" />
          </div>
        )}
        {collapsed && user && (
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Sign out"
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500 mb-1"
          >

            <LogOut size={15} />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </aside>

  );
}