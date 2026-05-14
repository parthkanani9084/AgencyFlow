export const LOGIN_URL = '/common/auth/login';
export const LOGOUT_URL = '/common/auth/logout';
export const REFRESH_TOKEN_URL = '/common/auth/refresh-token';

// Base URLs
export const CLIENT_BASE_URL = '/owner/client';
export const TEAM_BASE_URL = '/owner/team';
export const TASK_BASE_URL = '/owner/task';
export const REEL_BASE_URL = '/owner/reel';

export const CLIENT_CREATE_URL = '/owner/client';
export const CLIENT_LIST_URL = '/owner/client';

//
export const CREATE_CAMPAIGN_URL = '/owner/campaign';
export const GET_CAMPAIGNS_URL = '/owner/campaign';
export const DELETE_CAMPAIGN_URL = '/owner/campaign/:id';
export const UPDATE_CAMPAIGN_URL = '/owner/campaign/:id';
export const GET_CAMPAIGN_BY_ID_URL = '/owner/campaign/:id';
export const LOG_CAMPAIGN_PERFORMANCE_URL = '/owner/campaign/:id/performance';
export const LOG_CAMPAIGN_PERFORMANCE_HISTORY_URL = '/owner/campaign/:id/performance-history';
export const DELETE_CAMPAIGN_PERFORMANCE_HISTORY_URL = '/owner/campaign/performance-history/:id';
export const GET_CAMPAIGN_ACTIVITY_URL = '/owner/campaign/activity';


// Specific Endpoint Constants (using base URLs)
export const CREATE_CLIENT_URL = CLIENT_BASE_URL;
export const GET_CLIENTS_URL = CLIENT_BASE_URL;

export const CREATE_TEAM_URL = TEAM_BASE_URL;
export const GET_TEAMS_URL = TEAM_BASE_URL;
export const GET_TEAM_ROLE_URL = TEAM_BASE_URL;

export const CREATE_TASK_URL = TASK_BASE_URL;
export const GET_TASKS_URL = TASK_BASE_URL;
export const GET_TASKS_HISTORY_URL = `${TASK_BASE_URL}/history`;

export const CREATE_REEL_URL = REEL_BASE_URL;
export const GET_REELS_URL = REEL_BASE_URL;
export const REEL_STATUS_UPDATE_URL = (id: string) => `${REEL_BASE_URL}/${id}/status`;

export const GET_NOTIFICATIONS_URL = '/common/notifications';
export const MARK_ALL_READ_NOTIFICATIONS_URL = '/common/notifications/mark-all-read';
export const READ_NOTIFICATION_URL = (id: string) => `/common/notifications/${id}/read`;
export const GET_DASHBOARD_URL = '/owner/dashboard';
