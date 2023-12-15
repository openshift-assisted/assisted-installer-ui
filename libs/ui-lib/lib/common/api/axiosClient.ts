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

function createClient() {
  return applyCaseMiddleware(
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
}

function createClientWithoutCaseConverter() {
  return withAssistedInstallerBasePath(axios.create());
}

let isInOcm = false;
let ocmClient: AxiosInstance | null;
let client = createClient();
let clientWithoutCaseConverter = createClientWithoutCaseConverter();

export const setAuthInterceptor = (authInterceptor: (client: AxiosInstance) => AxiosInstance) => {
  isInOcm = true;
  ocmClient = authInterceptor(axios.create());

  // Instances of Axios with URL intercepted using Assisted-installer's base-path
  client = authInterceptor(createClient());
  clientWithoutCaseConverter = authInterceptor(createClientWithoutCaseConverter());
};

export { client, ocmClient, isInOcm, clientWithoutCaseConverter };
