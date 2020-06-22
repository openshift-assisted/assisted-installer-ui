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

export const setClient = (axiosInstance: AxiosInstance) => {
  client = applyCaseMiddleware(axiosInstance);
};

export { client };
