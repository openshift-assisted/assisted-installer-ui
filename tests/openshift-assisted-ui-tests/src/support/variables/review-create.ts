// Review and Create

// validations
Cypress.env('clusterValidations', '.review-expandable');
Cypress.env('clusterValidationsValueId', '[data-testid=cluster-validations-value]');
Cypress.env('hostValidationsValueId', '[data-testid=host-validations-value]');
Cypress.env('allValidationsPassedText', 'All validations passed');

// summary
Cypress.env('clusterAddressValueId', '[data-testid=cluster-address]');
Cypress.env('openshiftVersionValueId', '[data-testid=openshift-version]');
Cypress.env('stackTypeValueId', '[data-testid="stack-type"]');
Cypress.env('machineNetworksValueId', '[data-testid="machine-networks"]');
