import { hasWizardSignal } from '../utils';
import * as fixtures from '../../fixtures';
import { getDay1InfraEnvApiPath } from './utils';

export const addDay1HostIntercepts = () => {
  const infraEnvApiPath = getDay1InfraEnvApiPath();
  cy.intercept('PATCH', `${infraEnvApiPath}/hosts/**`, (req) => {
    const patchedHostId = req.url.match(/\/hosts\/(.+)$/)?.[1];
    const { hostIds, getUpdatedHosts } = fixtures;
    const index = hostIds.findIndex((hostId) => hostId === patchedHostId);
    if (req.body.host_name) {
      req.alias = `rename-host-${index + 1}`;
    }

    const hostsFixture = getUpdatedHosts();
    req.reply(hostsFixture[index]);
  });

  cy.intercept('GET', `${infraEnvApiPath}/hosts`, (req) => {
    if (Cypress.env('AI_SCENARIO') === 'AI_OVE_CREATE_MULTINODE') {
      req.reply(
        hasWizardSignal('HOST_DISCOVERED_3') ? fixtures.oveBoundHosts : fixtures.oveUnboundHosts,
      );
    } else {
      req.reply([]);
    }
  }).as('get-hosts');

  cy.intercept('POST', `${infraEnvApiPath}/hosts/*/actions/bind`, (req) => {
    const boundHostId = req.url.match(/\/hosts\/(.+?)\/actions\/bind/)?.[1];
    const index = fixtures.hostIds.findIndex((hostId) => hostId === boundHostId);
    req.alias = `bind-host-${index + 1}`;
    req.reply(fixtures.oveBoundHosts[index]);
  });
};
