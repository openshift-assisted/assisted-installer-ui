import * as path from 'path';

// Hosts Status
Cypress.env('hostStatusReady', 'Ready');
Cypress.env('hostStatusDiscovering', 'Discovering');
Cypress.env('hostStatusPendingInput', 'Pending input');
Cypress.env('hostStatusInsufficient', 'Insufficient');

// Support Levels
Cypress.env('techPreviewSupportLevel', 'Technology Preview');
Cypress.env('devPreviewSupportLevel', 'Developer Preview');
Cypress.env('vmsSupportLimitationText', 'Your cluster will be subject to support limitations');

// CVO Events Table
Cypress.env('cluterEventsButtonId', '#cluster-events-button');
Cypress.env('searchTextId', '#search-text');
Cypress.env('clusterEventsToolbarId', '#clusters-events-toolbar');
Cypress.env('eventsTableAriaLabel', 'table[aria-label="Events table"]');

Cypress.env('kubeconfigNoingressFile', path.join(Cypress.config('downloadsFolder'), 'kubeconfig-noingress'));
Cypress.env('kubeconfigFile', path.join(String(Cypress.config('downloadsFolder')), 'kubeconfig'));
Cypress.env('kubeadminPasswordFilePath', path.join(Cypress.config('downloadsFolder'), 'kubeadmin-password'));
Cypress.env('installConfigFilePath', path.join(Cypress.config('downloadsFolder'), 'install-config.yaml'));
Cypress.env('resultFile', path.join(Cypress.config('downloadsFolder'), 'cypress-deployment-result'));
Cypress.env('validationsResultFile', path.join(Cypress.config('downloadsFolder'), 'validations-deployment-result'));
