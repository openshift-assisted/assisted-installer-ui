import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import { getScenarioFixtureMapping } from './utils';

export const mockBundlesResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  req.reply(fixtureMapping?.bundles || []);
};

export const mockSupportedOperators: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  req.reply(fixtureMapping?.supported_operators || []);
};

export const addOperatorsIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/operators/bundles*', mockBundlesResponse).as(
    'bundles',
  );
  cy.intercept('GET', '/api/assisted-install/v2/supported-operators', mockSupportedOperators).as(
    'supported-operators',
  );
};
