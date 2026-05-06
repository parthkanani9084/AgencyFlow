export const ROUTES = {
  // Auth
  LOGIN: '/sign-up-login-screen',
  SUPER_ADMIN_LOGIN: '/superadmin/login',
  SUPER_ADMIN_VERIFY: '/superadmin/verify',

  // Dashboards
  SUPER_ADMIN_DASHBOARD: '/superadmin/dashboard',
  OWNER_DASHBOARD: '/dashboard',
  MANAGER_DASHBOARD: '/manager-dashboard',
  SHOOTER_DASHBOARD: '/shooter-dashboard',
  EDITOR_DASHBOARD: '/editor-dashboard',
  ADS_MANAGER_DASHBOARD: '/ads-manager-dashboard',
  SOCIAL_MEDIA_MANAGER_DASHBOARD: '/social-media-manager-dashboard',

  // Client Workspace
  CLIENT_PROFILE: '/client/profile',
  CLIENT_CAMPAIGNS: '/client/campaigns',
  CLIENT_REELS: '/client/reels',

  // Management
  CAMPAIGN_MANAGEMENT: '/campaign-management',
  CLIENT_MANAGEMENT: '/client-management',
  TASK_MANAGEMENT: '/task-management',

  // Super Admin Management
  SUPER_ADMIN_AGENCIES: '/superadmin/business-agency',
  SUPER_ADMIN_SUBSCRIPTIONS: '/superadmin/subscription',

  // Analytics & Core
  ADS_TRACKING: '/ads-tracking',
  REPORTS: '/reports',
  TEAM: '/team',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
