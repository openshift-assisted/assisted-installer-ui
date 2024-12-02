import { defineConfig } from 'cypress';
import pluginsConfig from './cypress/plugins';

const GLOBAL_TIMEOUT = Number(process.env.GLOBAL_TIMEOUT) || 60000;
const GLOBAL_BASE_URL = 'http://localhost:4173';

export default defineConfig({
  modifyObstructiveCode: false,
  viewportWidth: 1360, // 16*85
  viewportHeight: 765, // 9*85
  env: {
    OPENSHIFT_VERSION: '4.14.16',
    DNS_DOMAIN_NAME: 'redhat.com',
    CLUSTER_NAME: 'ai-e2e-sno',
    HOST_RENAME: 'e2e-control-host',
    API_BASE_URL: GLOBAL_BASE_URL,
    API_VERSION: 'v2',
    NUM_MASTERS: '1',
    NUM_WORKERS: '0',
    HOST_REGISTRATION_TIMEOUT: GLOBAL_TIMEOUT,
  },
  e2e: {
    setupNodeEvents(on, config) {
      return pluginsConfig(on, config);
    },
    specPattern: 'cypress/integration/**/*.cy.ts',
    supportFile: 'cypress/support/index.ts',
    baseUrl: GLOBAL_BASE_URL,
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 5,
  },
});
