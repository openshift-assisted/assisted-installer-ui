Cypress.Commands.add('byDataTestId', (selector) => cy.get(`[data-test-id="${selector}"]`));

Cypress.Commands.add(
  'newByDataTestId',
  (selector, timeout = Cypress.config('defaultCommandTimeout')) =>
    cy.get(`[data-testid="${selector}"]`, { timeout: timeout }),
);

Cypress.Commands.add(
  'hostDetailSelector',
  (row, label, timeout = Cypress.config('defaultCommandTimeout')) =>
    cy.get(
      `table.hosts-table > tbody:nth-child(${row}) > tr:nth-child(1) > [data-label="${label}"]`,
      {
        timeout: timeout,
      },
    ),
);

Cypress.Commands.add('getClusterNameLinkSelector', (clusterName = Cypress.env('CLUSTER_NAME')) =>
  cy.get(`#cluster-link-${clusterName}`),
);
