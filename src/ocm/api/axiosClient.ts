import axios, { AxiosInstance } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { camelCase } from 'camel-case';

// conforms basePath in swagger.json
export const BASE_PATH = '/api/assisted-install';

// Prevent axios converter to change object keys from '4.7' to '4_7'
const axiosCaseConverterOptions = {
  caseFunctions: {
    camel: (input: string) =>
      camelCase(input, {
        stripRegexp: /[^A-Z0-9.]+/gi,
      }),
  },
};

const getDefaultClient = (applyCase = true) => {
  const client = axios.create();
  client.interceptors.request.use((cfg) => ({
    ...cfg,
    url: `${process.env.REACT_APP_API_ROOT}${cfg.url}`,
  }));
  if (applyCase) {
    return applyCaseMiddleware(client, axiosCaseConverterOptions);
  }
  return client;
};

let client: AxiosInstance = getDefaultClient();
let ocmClient: AxiosInstance | null;
let noCoverterClient = getDefaultClient(false);

const aiInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use((cfg) => ({
    ...cfg,
    url: `${BASE_PATH}${cfg.url}`,
  }));
  return client;
};

export const setAuthInterceptor = (authInterceptor: (client: AxiosInstance) => AxiosInstance) => {
  ocmClient = authInterceptor(axios.create());
  client = applyCaseMiddleware(
    aiInterceptor(authInterceptor(axios.create())),
    axiosCaseConverterOptions,
  );
  noCoverterClient = aiInterceptor(authInterceptor(axios.create()));
};

export { client, ocmClient, noCoverterClient };
