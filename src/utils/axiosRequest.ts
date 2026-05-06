import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { ROUTES } from '../constants/routes';
import { shouldShowToast, TOAST_CONFIG } from './toastConfig';
import { showErrorToast, showSuccessToast } from './toastHandler';

const baseConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes(ROUTES.LOGIN) || url.includes(ROUTES.SUPER_ADMIN_LOGIN) ||
    url.includes(ROUTES.SUPER_ADMIN_VERIFY) ||
    url === ROUTES.LOGIN
  );
};
const createResponseInterceptor = () => {
  return [
    (response: AxiosResponse) => {
      const method = response.config.method?.toUpperCase();
      const url = response.config.url;
      if (
        TOAST_CONFIG.enableSuccessToasts &&
        (method === 'POST' || method === 'PUT' || method === 'DELETE') &&
        shouldShowToast(url, method)
      ) {
        showSuccessToast(response.data);
      }
      return response;
    },
    (error: any) => {
      const request = error?.config;

      if (TOAST_CONFIG.enableErrorToasts) {
        if (
          error?.response?.status === 401 ||
          shouldShowToast(request?.url, request?.method?.toUpperCase())
        ) {
          showErrorToast(error);
        }
      }
      return Promise.reject(error);
    },
  ] as const;
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create(baseConfig);

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (isAuthEndpoint(config.url)) {
        return config;
      }

      if (typeof window === 'undefined') {
        return config;
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(...createResponseInterceptor());

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
