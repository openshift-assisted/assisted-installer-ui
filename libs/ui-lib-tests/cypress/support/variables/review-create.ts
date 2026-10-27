// Review and Create

// Preflight check section
Cypress.expose('preflightChecksSectionExpander', '.review-expandable button');
Cypress.expose('clusterPreflightChecksTitle', '[data-testid=cluster-preflight-checks-title]');
Cypress.expose('clusterPreflightChecksResult', '[data-testid=cluster-preflight-checks-value]');
Cypress.expose('hostsPreflightChecksResult', '[data-testid=host-preflight-checks-value]');
Cypress.expose('allValidationsPassedText', 'All checks passed');

// summary
Cypress.expose('clusterAddressValueId', '[data-testid=cluster-address]');
Cypress.expose('openshiftVersionValueId', '[data-testid=openshift-version]');
Cypress.expose('stackTypeValueId', '[data-testid="stack-type"]');
Cypress.expose('machineNetworksValueId', '[data-testid="machine-networks"]');
