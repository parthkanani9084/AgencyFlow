export const LOGIN_URL = '/common/auth/login';
export const LOGOUT_URL = '/common/auth/logout';
// Base URLs
export const CLIENT_BASE_URL = '/owner/client';
export const TEAM_BASE_URL = '/owner/team';
export const TASK_BASE_URL = '/owner/task';

export const CLIENT_CREATE_URL = '/owner/client';
export const CLIENT_LIST_URL = '/owner/client';

// Specific Endpoint Constants (using base URLs)
export const CREATE_CLIENT_URL = CLIENT_BASE_URL;
export const GET_CLIENTS_URL = CLIENT_BASE_URL;

export const CREATE_TEAM_URL = TEAM_BASE_URL;
export const GET_TEAMS_URL = TEAM_BASE_URL;
export const GET_TEAM_ROLE_URL = TEAM_BASE_URL;

export const CREATE_TASK_URL = TASK_BASE_URL;
export const GET_TASKS_URL = TASK_BASE_URL;
export const GET_TASKS_HISTORY_URL = `${TASK_BASE_URL}/history`;
