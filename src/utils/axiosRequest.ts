import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ROUTES } from '../constants/routes';
import { shouldShowToast, TOAST_CONFIG } from './toastConfig';
import { showErrorToast, showSuccessToast } from './toastHandler';
import store from './localstorage';
import { STORAGE_KEYS } from './constants';
import { REFRESH_TOKEN_URL } from '../api/endpoints';
interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

const AUTH_HEADER_PREFIX = 'Bearer';
const AUTH_ENDPOINTS = [
  ROUTES.LOGIN,
  ROUTES.SUPER_ADMIN_LOGIN,
  ROUTES.SUPER_ADMIN_VERIFY,
  REFRESH_TOKEN_URL,
];

const getAuthToken = () => store.getValue(STORAGE_KEYS.AUTH_TOKEN);
const getRefreshToken = () => store.getValue(STORAGE_KEYS.REFRESH_TOKEN);

const setTokens = (accessToken: string, refreshToken: string) => {
  store.setValue(STORAGE_KEYS.AUTH_TOKEN, accessToken);
  store.setValue(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

const clearTokens = () => {
  store.removeValue(STORAGE_KEYS.AUTH_TOKEN);
  store.removeValue(STORAGE_KEYS.REFRESH_TOKEN);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('af_user');
  }
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

const logout = () => {
  if (typeof window === 'undefined') return;

  clearTokens();

  const { pathname } = window.location;
  const isSuperAdminPath = pathname.startsWith('/superadmin');
  const isLoginPage = pathname.includes(ROUTES.LOGIN) || pathname.includes(ROUTES.SUPER_ADMIN_LOGIN);

  if (!isLoginPage) {
    window.location.href = isSuperAdminPath ? ROUTES.SUPER_ADMIN_LOGIN : ROUTES.LOGIN;
  }
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

const handleTokenRefresh = async (instance: AxiosInstance, originalRequest: any) => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then(token => {
        originalRequest.headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`;
        return instance(originalRequest);
      })
      .catch(err => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    logout();
    return Promise.reject(new Error('No refresh token available'));
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await axios.post(`${apiUrl}${REFRESH_TOKEN_URL}`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data?.results || {};

    if (!accessToken || !newRefreshToken) {
      throw new Error('Invalid refresh token response');
    }

    setTokens(accessToken, newRefreshToken);
    instance.defaults.headers.common.Authorization = `${AUTH_HEADER_PREFIX} ${accessToken}`;
    originalRequest.headers.Authorization = `${AUTH_HEADER_PREFIX} ${accessToken}`;

    processQueue(null, accessToken);
    return instance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    logout();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

const handleSuccessResponse = (response: AxiosResponse) => {
  const method = response.config.method?.toUpperCase();
  const url = response.config.url;

  if (
    TOAST_CONFIG.enableSuccessToasts &&
    method && ['POST', 'PUT', 'DELETE'].includes(method) &&
    shouldShowToast(url, method)
  ) {
    showSuccessToast(response.data);
  }
  return response;
};

const handleErrorResponse = (instance: AxiosInstance) => async (error: any) => {
  const originalRequest = error?.config;
  const status = error?.response?.status;

  if (status === 401 && !originalRequest?._retry) {
    if (originalRequest?.url?.includes(REFRESH_TOKEN_URL)) {
      logout();
      return Promise.reject(error);
    }
    return handleTokenRefresh(instance, originalRequest);
  }

  if (TOAST_CONFIG.enableErrorToasts) {
    const method = originalRequest?.method?.toUpperCase();
    if (status === 401 || shouldShowToast(originalRequest?.url, method)) {
      showErrorToast(error);
    }
  }

  return Promise.reject(error);
};

const baseConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create(baseConfig);

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (isAuthEndpoint(config.url)) return config;

      if (typeof window !== 'undefined') {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`;
        }
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    error => Promise.reject(error)
  );

  instance.interceptors.response.use(
    handleSuccessResponse,
    handleErrorResponse(instance)
  );

  return instance;
};

let axiosInstance: AxiosInstance | null = null;

export const axiosRequest = (): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = createAxiosInstance();
  }
  return axiosInstance;
};

export const axiosRequestDirect = axiosRequest();
