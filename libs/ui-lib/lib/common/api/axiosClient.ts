import axios, { AxiosInstance } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { camelCase } from 'camel-case';

const withAssistedInstallerBasePath = (client: AxiosInstance): AxiosInstance => {
  // Conforms with basePath in swagger.json
  const basePath = '/api/assisted-install';
  client.interceptors.request.use((cfg) => {
    if (cfg.url) {
      try {
        const url = new URL(cfg.url);
        cfg.url = `${url.origin}${basePath}${url.pathname}`;
      } catch {
        cfg.url = `${basePath}${cfg.url}`;
      }
    }

    return cfg;
  });
  return client;
};

let isInOcm = false;
let ocmClient: AxiosInstance | null;
let client = applyCaseMiddleware(
  withAssistedInstallerBasePath(axios.create()),
  // Prevents axios converter to change object keys from '4.7-fc2' to '4_7Fc2'
  {
    caseFunctions: {
      camel: (input: string) =>
        camelCase(input, {
          stripRegexp: /[^A-Z0-9.-]+/gi,
        }),
    },
  },
);
let clientWithoutCaseConverter = withAssistedInstallerBasePath(axios.create());

const getOcmClient = () => ocmClient;

export const setAuthInterceptor = (authInterceptor: (client: AxiosInstance) => AxiosInstance) => {
  isInOcm = true;
  ocmClient = authInterceptor(axios.create());
  client = authInterceptor(client);
  clientWithoutCaseConverter = authInterceptor(clientWithoutCaseConverter);
};

export { client, getOcmClient, isInOcm, clientWithoutCaseConverter };
