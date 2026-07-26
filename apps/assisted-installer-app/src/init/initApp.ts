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

const buildAuthInterceptor = (): ((client: AxiosInstance) => AxiosInstance) => {
  const authInterceptor = (client: AxiosInstance): AxiosInstance => {
    client.interceptors.request.use((config) => {
      const BASE_URL = config.baseURL || getBaseUrl();
      config.url = `${BASE_URL}${config.url ?? ''}`;
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
