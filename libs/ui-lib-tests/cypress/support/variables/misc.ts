import * as path from 'path';

// Hosts Status
Cypress.expose('hostStatusReady', 'Ready');
Cypress.expose('hostStatusDiscovering', 'Discovering');
Cypress.expose('hostStatusPendingInput', 'Pending input');
Cypress.expose('hostStatusInsufficient', 'Insufficient');

// Support Levels
Cypress.expose('techPreviewSupportLevel', 'Technology Preview');
Cypress.expose('devPreviewSupportLevel', 'Developer Preview');
Cypress.expose('vmsSupportLimitationText', 'Your cluster will be subject to support limitations');

// CVO Events Table
Cypress.expose('cluterEventsButtonId', '#cluster-events-button');
Cypress.expose('searchTextId', '#search-text');
Cypress.expose('clusterEventsToolbarId', '#clusters-events-toolbar');
Cypress.expose('eventsTableAriaLabel', 'table[aria-label="Events table"]');

Cypress.expose(
  'kubeconfigNoingressFile',
  path.join(Cypress.config('downloadsFolder'), 'kubeconfig-noingress'),
);
Cypress.expose('kubeconfigFile', path.join(String(Cypress.config('downloadsFolder')), 'kubeconfig'));
Cypress.expose(
  'kubeadminPasswordFilePath',
  path.join(Cypress.config('downloadsFolder'), 'kubeadmin-password'),
);
Cypress.expose(
  'installConfigFilePath',
  path.join(Cypress.config('downloadsFolder'), 'install-config.yaml'),
);
Cypress.expose(
  'resultFile',
  path.join(Cypress.config('downloadsFolder'), 'cypress-deployment-result'),
);
Cypress.expose(
  'validationsResultFile',
  path.join(Cypress.config('downloadsFolder'), 'validations-deployment-result'),
);
