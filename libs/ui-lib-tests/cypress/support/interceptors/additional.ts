import * as fixtures from '../../fixtures';
import { getDay1ClusterApiPath } from './utils';

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

  cy.intercept('GET', `${getDay1ClusterApiPath()}/downloads/credentials?file_name=kubeconfig`, {
    statusCode: 200,
    headers: { 'content-type': 'application/octet-stream' },
    body: 'mock-kubeconfig-content',
  }).as('download-kubeconfig');

  cy.intercept(
    'GET',
    `${getDay1ClusterApiPath()}/downloads/credentials?file_name=kubeadmin-password`,
    {
      statusCode: 200,
      headers: { 'content-type': 'application/octet-stream' },
      body: 'mock-kubeadmin-password',
    },
  ).as('download-kubeadmin-password');
};
