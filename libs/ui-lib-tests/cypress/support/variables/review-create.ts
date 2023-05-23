// Review and Create

// Preflight check section
Cypress.env('preflightChecksSectionExpander', '.review-expandable button');
Cypress.env('clusterPreflightChecksTitle', '[data-testid=cluster-preflight-checks-title]');
Cypress.env('clusterPreflightChecksResult', '[data-testid=cluster-preflight-checks-value]');
Cypress.env('hostsPreflightChecksResult', '[data-testid=host-preflight-checks-value]');
Cypress.env('allValidationsPassedText', 'All checks passed');

// summary
Cypress.env('clusterAddressValueId', '[data-testid=cluster-address]');
Cypress.env('openshiftVersionValueId', '[data-testid=openshift-version]');
Cypress.env('stackTypeValueId', '[data-testid="stack-type"]');
Cypress.env('machineNetworksValueId', '[data-testid="machine-networks"]');
