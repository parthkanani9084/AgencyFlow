export const LOGIN_URL = '/common/auth/login';
export const LOGOUT_URL = '/common/auth/logout';
export const CLIENT_CREATE_URL = '/owner/client';
export const CLIENT_LIST_URL = '/owner/client';

export const TEAM_CREATE_URL = '/owner/team';
export const TEAM_LIST_URL = '/owner/team';
export const TEAM_ROLE_URL = (id: string) => `/owner/team/${id}/role`;

export const TASK_CREATE_URL = '/owner/task';
