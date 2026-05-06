import { get } from 'lodash';
import { AxiosRequestConfig } from 'axios';
import { axiosRequest } from './axiosRequest';

interface AxiosHelperReturn {
  request: (axiosOpts: any) => Promise<any>;
  get: (url: string, params?: Record<string, any>, config?: AxiosRequestConfig) => Promise<any>;
  post: (url: string, body?: any, options?: AxiosRequestConfig) => Promise<any>;
  put: (url: string, body?: any, options?: AxiosRequestConfig) => Promise<any>;
  delete: (url: string, body?: any) => Promise<any>;
}

export const AxiosHelper = (): AxiosHelperReturn => {
  const _instance = axiosRequest();

  const _request = async (axiosOpts: any): Promise<any> => {
    try {
      const response = await _instance.request({
        responseType: 'json',
        ...axiosOpts,
        method: axiosOpts.method || 'get',
      });

      return get(response, 'data');
    } catch (error: any) {
      return Promise.reject(error);
    }
  };

  return {
    request: _request,
    get: async (url, params = {}, config: AxiosRequestConfig = {}) => {
      const response = await _instance.get(url, { params, ...config });
      return response.data;
    },
    post: async (url, body, options = {}) => {
      const response = await _instance.post(url, body, options);
      return response.data;
    },
    put: async (url, body, options = {}) => {
      try {
        const response = await _instance.put(url, body, options);
        return response.data;
      } catch (error: any) {
        throw error.response?.data;
      }
    },
    delete: async (url, params?) => {
      if (params && typeof params === 'object' && !Array.isArray(params)) {
        const response = await _instance.delete(url, { params });
        return response.data;
      }
      const response = await _instance.delete(url, { data: params });
      return response.data;
    },
  };
};

export const AxiosRequest = AxiosHelper();
export default AxiosRequest;
