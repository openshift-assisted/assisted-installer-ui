/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

let shouldSkip = false;

module.exports = (on) => {
  on('task', {
    resetShouldSkipFlag() {
      shouldSkip = false;
      return null;
    },
    shouldSkip(value) {
      // From the moment a test fails, set the skip flag to true for all remaining tests
      if (value === true) {
        shouldSkip = value;
      }
      return shouldSkip;
    },
  });
  on('before:browser:launch', (browser, options) => {
    // only Firefox requires all mime types to be listed
    if (browser.family === 'firefox') {
      const existingMimeTypes = options.preferences['browser.helperApps.neverAsk.saveToDisk'];
      // PSI reports 'application/octet-stream' as mime
      // AWS reports 'binary/octet-stream' as mime
      const myMimeType = 'application/octet-stream,binary/octet-stream';

      // prevents the browser download prompt
      options.preferences['browser.helperApps.neverAsk.saveToDisk'] = `${existingMimeTypes},${myMimeType}`;
      options.preferences['browser.helperApps.neverAsk.openFile'] = `${existingMimeTypes},${myMimeType}`;
      options.preferences['browser.helperApps.alwaysAsk.force'] = false;
      options.preferences['browser.download.manager.useWindow'] = false;
      options.preferences['browser.download.folderList'] = 1;
      options.preferences['browser.download.manager.showWhenStarting'] = false;
      options.preferences['browser.download.manager.focusWhenStarting'] = false;
      options.preferences['browser.download.manager.showAlertOnComplete'] = false;
      options.preferences['browser.download.manager.closeWhenDone'] = false;
    }
    return options;
  });
};
