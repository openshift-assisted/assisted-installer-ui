import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import * as fixtures from '../../fixtures';
import {
  allInfraEnvsApiPath,
  getDay1InfraEnvApiPath,
  getScenarioFixtureMapping,
  transformInfraEnvFixture,
} from './utils';

export const mockInfraEnvResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.infraEnvs) {
    req.reply(transformInfraEnvFixture(fixtureMapping.infraEnvs));
  } else {
    req.reply(fixtures.baseInfraEnv);
  }
};

export const mockInfraEnvListResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  req.reply(fixtureMapping?.infraEnvs ? [transformInfraEnvFixture(fixtureMapping.infraEnvs)] : []);
};

export const addDay1InfraEnvIntercepts = () => {
  const infraEnvApiPath = getDay1InfraEnvApiPath();
  // Actions on particular infraEnv
  cy.intercept('GET', infraEnvApiPath, mockInfraEnvResponse).as('infra-env-details');

  cy.intercept('GET', `${infraEnvApiPath}/downloads/image-url`, fixtures.imageDownload).as(
    'download-iso-image',
  );

  // Actions on all the infraEnvs
  cy.intercept('GET', allInfraEnvsApiPath, mockInfraEnvListResponse).as('infra-envs');

  cy.intercept('PATCH', infraEnvApiPath, mockInfraEnvResponse).as('update-infra-env');

  cy.intercept('GET', `${allInfraEnvsApiPath}?cluster_id=${Cypress.env('clusterId')}`, [
    fixtures.baseInfraEnv,
  ]).as('filter-infra-envs');

  cy.intercept('POST', allInfraEnvsApiPath, mockInfraEnvResponse).as('create-infra-env');
};
