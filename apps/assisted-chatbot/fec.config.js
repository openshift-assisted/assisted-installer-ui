const path = require('path');
const { insights } = require('./package.json');
const moduleName = insights.appname.replace(/-(\w)/g, (_, match) => match.toUpperCase());

module.exports = {
  appUrl: '/openshift/assisted-installer-ui-chatbot',
  appEntry: path.resolve(__dirname, './src/AppEntry.tsx'),
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  stripAllPfStyles: true,
  sassPrefix: `.${moduleName}`,
  interceptChromeConfig: false,
  plugins: [],
  hotReload: process.env.HOT === 'true',
  nodeModulesDirectories: '../../node_modules',
  moduleFederation: {
    exposes: {
      './ChatbotMessageEntry': path.resolve(
        __dirname,
        './src/components/ChatbotMessageEntry/ChatbotMessageEntry.tsx',
      ),
      './useAsyncChatbot': path.resolve(__dirname, './src/hooks/useAsyncChatbot.tsx'),
    },
  },
  routes: {
    '/apps/assisted-installer-ui-chatbot': { host: 'http://localhost:8003' },
  },
};
