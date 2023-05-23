const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  modifyObstructiveCode: false,
  video: false,
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  chromeWebSecurity: false,
  viewportWidth: 1440,
  viewportHeight: 1080,
  execTimeout: 12000,
  defaultCommandTimeout: 12000,
  requestTimeout: 12000,
  responseTimeout: 12000,
  pageLoadTimeout: 12000,
  trashAssetsBeforeRuns: false,
  env: {
    OPENSHIFT_VERSION: '4.12.14',
    DNS_DOMAIN_NAME: 'redhat.com',
    CLUSTER_NAME: 'ai-e2e-sno',
    HOST_RENAME: 'e2e-control-host',
    REMOTE_SSH_ID_FILE: '',
    REMOTE_USER: '',
    REMOTE_HOST: '',
    PULL_SECRET:
      '{"auths":{"cloud.openshift.com":{"auth":"==","email":"some-user@redhat.com"},"quay.io":{"auth":"==","email":"some-user@redhat.com"},"registry.connect.redhat.com":{"auth":"","email":"some-user@redhat.com"},"registry.redhat.io":{"auth":"","email":"some-user@redhat.com"}}}',
    API_BASE_URL: 'http://localhost:4173',
    API_VERSION: 'v2',
    DEV_FLAG: true,
    NUM_MASTERS: '1',
    NUM_WORKERS: '0',
    HOST_REGISTRATION_TIMEOUT: 12000,
    ASSISTED_MINIMAL_ISO: false,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./src/plugins/index.ts')(on, config);
    },
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
    baseUrl: 'http://localhost:4173',
    excludeSpecPattern: [],
    experimentalRunAllSpecs: true,
  },
});
