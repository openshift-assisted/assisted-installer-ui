import * as fixtures from '../../fixtures';

export const addAdditionalIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/domains', [
    { domain: 'e2e.redhat.com', provider: 'route53' },
  ]);

  cy.intercept('GET', '/api/assisted-install/v2/**/default-config', fixtures.defaultConfig).as(
    'get-default-config',
  );

  cy.intercept('POST', '/api/accounts_mgmt/v1/access_token', (req) => {
    req.reply(fixtures.pullSecret);
  });

  cy.intercept('GET', '/api/pull-secret', (req) => {
    req.reply(fixtures.pullSecret);
  });

  cy.intercept('GET', '/api/accounts_mgmt/v1/current_account', (req) => {
    req.reply(fixtures.ocmUserAccount);
  });
};
