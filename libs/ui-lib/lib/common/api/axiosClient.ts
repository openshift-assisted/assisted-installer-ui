import axios, { AxiosInstance } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { camelCase } from 'camel-case';
import { authInterceptor } from './authInterceptor';

const withAssistedInstallerBasePath = (client: AxiosInstance): AxiosInstance => {
  // Conforms with basePath in swagger.json
  const basePath = '/api/assisted-install';
  client.interceptors.request.use((cfg) => {
    if (cfg.url) {
      try {
        const url = new URL(cfg.url);
        cfg.url = `${url.origin}${basePath}${url.pathname}${url.search}`;
      } catch {
        // This usually happens when the request is issued to a localhost endpoint.
        cfg.url = `${basePath}${cfg.url}`;
      }
    }

    return cfg;
  });
  return client;
};

const isInOcm = false;
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
let clientWithoutCaseConverter = withAssistedInstallerBasePath(axios.create());
//I need to figure out how to know if we are in OCM or not
if (isInOcm) {
  ocmClient = authInterceptor(axios.create());
  client = authInterceptor(client);
  clientWithoutCaseConverter = authInterceptor(clientWithoutCaseConverter);
}

export { client, ocmClient, isInOcm, clientWithoutCaseConverter };
