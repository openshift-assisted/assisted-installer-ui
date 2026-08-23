const path = require('path');
const { dependencies } = require('./package.json');

const i18nextVersion = require('../../node_modules/i18next/package.json').version;
const reactI18nextVersion = require('../../node_modules/react-i18next/package.json').version;

module.exports = {
  appUrl: '/openshift/assisted-installer-app',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  stripAllPfStyles: true,
  /**
   * Change accordingly to your appname in package.json.
   * The `sassPrefix` attribute is only required if your `appname` includes the dash `-` characters.
   * If the dash character is present, you will have to add a camelCase version of it to the sassPrefix.
   * If it does not contain the dash character, remove this configuration.
   */
  sassPrefix: '.assisted-installer-app, .assistedInstallerApp',
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  hotReload: process.env.HOT === 'true',
  nodeModulesDirectories: '../../node_modules',
  moduleFederation: {
    shared: [
      {
        i18next: {
          singleton: true,
          eager: true,
          requiredVersion: dependencies.i18next,
          version: i18nextVersion,
        },
      },
      {
        'react-i18next': {
          singleton: true,
          eager: true,
          requiredVersion: dependencies['react-i18next'],
          version: reactI18nextVersion,
        },
      },
    ],
    exposes: {
      './RootApp': path.resolve(__dirname, './src/components/RootApp.tsx'),
      './TechnologyPreview': path.resolve(__dirname, './src/components/TechnologyPreview.tsx'),
      './NoPermissionsError': path.resolve(__dirname, './src/components/NoPermissionsError.tsx'),
      './ExternalLink': path.resolve(__dirname, './src/components/ExternalLink.tsx'),
      './AssistedInstallerDetailCard': path.resolve(
        __dirname,
        './src/components/AssistedInstallerDetailCard.tsx',
      ),
      './ClusterStatus': path.resolve(__dirname, './src/components/ClusterStatus.tsx'),
      './HostsClusterDetailTab': path.resolve(
        __dirname,
        './src/components/HostsClusterDetailTab.tsx',
      ),
      './getAddHostsTabState': path.resolve(__dirname, './src/components/getAddHostsTabState.ts'),
      './Services': path.resolve(__dirname, './src/components/Services.tsx'),
      './computeAIClusterMetrics': path.resolve(
        __dirname,
        './src/components/computeAIClusterMetrics.ts',
      ),
    },
    exclude: [],
  },
  routes: {
    '/api/assisted-installer-app': { host: 'http://localhost:8003' },
    '/apps/assisted-installer-app': { host: 'http://localhost:8003' },
  },
};
