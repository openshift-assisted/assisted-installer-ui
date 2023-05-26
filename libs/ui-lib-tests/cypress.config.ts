import { defineConfig } from 'cypress';
import pluginsConfig from './cypress/plugins';
import * as dummyPullSecret from './cypress/fixtures/data/dummy-pull-secret.json';

const GLOBAL_TIMEOUT = Number(process.env.GLOBAL_TIMEOUT) || 60000;
const GLOBAL_BASE_URL = 'http://localhost:5173';

export default defineConfig({
  modifyObstructiveCode: false,
  viewportWidth: 1600,
  viewportHeight: 900,
  env: {
    OPENSHIFT_VERSION: '4.12.14',
    DNS_DOMAIN_NAME: 'redhat.com',
    CLUSTER_NAME: 'ai-e2e-sno',
    HOST_RENAME: 'e2e-control-host',
    REMOTE_SSH_ID_FILE: '',
    REMOTE_USER: '',
    REMOTE_HOST: '',
    PULL_SECRET: JSON.stringify(dummyPullSecret),
    API_BASE_URL: GLOBAL_BASE_URL,
    API_VERSION: 'v2',
    DEV_FLAG: true,
    NUM_MASTERS: '1',
    NUM_WORKERS: '0',
    HOST_REGISTRATION_TIMEOUT: GLOBAL_TIMEOUT,
    ASSISTED_MINIMAL_ISO: false,
  },
  e2e: {
    setupNodeEvents(on, config) {
      return pluginsConfig(on, config);
    },
    specPattern: 'cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/index.ts',
    baseUrl: GLOBAL_BASE_URL,
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 5,
  },
});
