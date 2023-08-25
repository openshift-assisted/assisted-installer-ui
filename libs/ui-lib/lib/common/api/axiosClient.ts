import axios, { AxiosInstance } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { camelCase } from 'camel-case';
const basePath = '/api/assisted-install';
const withAssistedInstallerBasePath = (client: AxiosInstance): AxiosInstance => {
  // Conforms with basePath in swagger.json

  client.interceptors.request.use((cfg) => {
    if (cfg.url) {
      try {
        const url = new URL(cfg.url);
        cfg.url = `${url.origin}${basePath}${url.pathname}`;
      } catch {
        cfg.url = `${basePath}${cfg.url}`;
      }
    } else {
      cfg.url = `${basePath}`;
    }

    return cfg;
  });
  return client;
};

let isInOcm = false;
let ocmClient: AxiosInstance | null;
let client = applyCaseMiddleware(
  withAssistedInstallerBasePath(axios.create()),
  // Prevents the axios-case-converter from changing object keys from '4.7-fc2' to '4_7Fc2'
  {
    caseFunctions: {
      camel: (input: string) =>
        camelCase(input, {
          stripRegexp: /[^A-Z0-9.-]+/gi,
        }),
    },
  },
);
const aiInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use((cfg) => {
    cfg.url = `${basePath}${cfg.url || ''}`;
    return cfg;
  });
  return client;
};
let clientWithoutCaseConverter = axios.create();

export const setAuthInterceptor = (authInterceptor: (client: AxiosInstance) => AxiosInstance) => {
  isInOcm = true;
  ocmClient = authInterceptor(axios.create());

  // Instances of Axios with URL intercepted using Assisted-installer's base-path
  client = authInterceptor(client);
  clientWithoutCaseConverter = aiInterceptor(authInterceptor(clientWithoutCaseConverter));
};

export { client, ocmClient, isInOcm, clientWithoutCaseConverter };
