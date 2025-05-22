const path = require('path');

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
    exposes: {
      './RootApp': path.resolve(__dirname, './src/components/RootApp.tsx'),
      './TechnologyPreview': path.resolve(
        __dirname,
        './src/components/TechnologyPreview.tsx'
      ),
      './NoPermissionsError': path.resolve(
        __dirname,
        './src/components/NoPermissionsError.tsx'
      ),
      './ExternalLink': path.resolve(
        __dirname,
        './src/components/ExternalLink.tsx'
      ),
      './AssistedInstallerDetailCard': path.resolve(
        __dirname,
        './src/components/AssistedInstallerDetailCard.tsx'
      ),
      './AssistedInstallerExtraDetailCard': path.resolve(
        __dirname,
        './src/components/AssistedInstallerExtraDetailCard.tsx'
      ),
      './ClusterStatus': path.resolve(
        __dirname,
        './src/components/ClusterStatus.tsx'
      ),
      './FeatureSupportsLevel': path.resolve(
        __dirname,
        './src/components/FeatureSupportsLevel.tsx'
      ),
      './HostsClusterDetailTab': path.resolve(
        __dirname,
        './src/components/HostsClusterDetailTab.tsx'
      ),
      './Services': path.resolve(
        __dirname,
        './src/components/Services.tsx'
      ),
    },
    exclude: [],
    shared: [],
  },
  routes: {
    '/api/assisted-installer-app': { host: 'http://localhost:8002' },
    '/apps/assisted-installer-app': { host: 'http://localhost:8002' }
  }
};
