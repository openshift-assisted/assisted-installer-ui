Cypress.Commands.add('byDataTestId', (selector) => cy.get(`[data-test-id="${selector}"]`));

Cypress.Commands.add('newByDataTestId', (selector, timeout = Cypress.config('defaultCommandTimeout')) =>
  cy.get(`[data-testid="${selector}"]`, { timeout: timeout }),
);

Cypress.Commands.add('hostDetailSelector', (row, label, timeout = Cypress.config('defaultCommandTimeout')) =>
  cy.get(`table.hosts-table > tbody:nth-child(${row}) > tr:nth-child(1) > [data-label="${label}"]`, {
    timeout: timeout,
  }),
);

Cypress.Commands.add('getClusterNameLinkSelector', (clusterName = Cypress.env('CLUSTER_NAME')) =>
  cy.get(`#cluster-link-${clusterName}`),
);

Cypress.Commands.add(
  'getIndexByName',
  (selector, name, timeout = Cypress.config('defaultCommandTimeout'), assertFound = true) => {
    // Returns only 1st match.
    cy.get(selector, {
      timeout: timeout,
    }).each((item, itemId) => {
      if (item.text() === name) {
        cy.wrap(itemId).as(name);
        // Found it, no need to look further...
        return false;
      } else {
        // cy.get will fail if there's no alias at all.
        cy.wrap(undefined).as(name);
        return true;
      }
    });
    if (assertFound) {
      cy.get(`@${name}`).then((itemId) => {
        expect(itemId).to.be.at.least(0);
      });
    }
  },
);
