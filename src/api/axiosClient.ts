import axios, { AxiosInstance } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const getDefaultClient = () => {
  const client = axios.create();
  client.interceptors.request.use((cfg) => ({
    ...cfg,
    url: `${process.env.REACT_APP_API_ROOT}${cfg.url}`,
  }));
  return applyCaseMiddleware(client);
};

let client: AxiosInstance = getDefaultClient();
let ocmClient: AxiosInstance;

const aiInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use((cfg) => ({
    ...cfg,
    // conforms basePath in swagger.json
    url: `/api/assisted-install/v1${cfg.url}`,
  }));
  return client;
};

export const setAuthInterceptor = (authInterceptor: (client: AxiosInstance) => AxiosInstance) => {
  ocmClient = authInterceptor(axios.create());
  client = applyCaseMiddleware(aiInterceptor(authInterceptor(axios.create())));
};

export { client, ocmClient };
