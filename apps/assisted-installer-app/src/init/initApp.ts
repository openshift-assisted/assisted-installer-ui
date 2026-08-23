import { Api, Config } from '@openshift-assisted/ui-lib/ocm';
import { AxiosInstance } from 'axios';

import '../i18n';
import { getBaseUrl } from '../config/config';

declare global {
  interface Window {
    ocmConfig?: {
      configData?: {
        apiGateway?: string;
      };
    };
  }
}

let initialized = false;

const isAbsoluteUrl = (url: string): boolean => /^https?:\/\//i.test(url) || url.startsWith('//');

const resolveRequestUrl = (baseUrl: string, requestPath: string | undefined): string => {
  const path = requestPath ?? '';
  if (!path) {
    return baseUrl.replace(/\/+$/, '');
  }
  if (isAbsoluteUrl(path)) {
    return path;
  }
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  return `${normalizedBase}/${normalizedPath}`;
};

const buildAuthInterceptor = (): ((client: AxiosInstance) => AxiosInstance) => {
  const authInterceptor = (client: AxiosInstance): AxiosInstance => {
    client.interceptors.request.use((config) => {
      const baseUrl = config.baseURL || getBaseUrl();
      config.url = resolveRequestUrl(baseUrl, config.url);
      return config;
    });
    return client;
  };
  return authInterceptor;
};

export const initApp = () => {
  if (!initialized) {
    // init only once
    initialized = true;
    Config.setRouteBasePath('/assisted-installer-app');
    Api.setAuthInterceptor(buildAuthInterceptor());
  }
};
