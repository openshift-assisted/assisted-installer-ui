import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import { hasWizardSignal } from '../utils';
import { allClustersApiPath, getScenarioFixtureMapping } from './utils';

export const mockCustomManifestResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  req.reply(fixtureMapping?.manifests || []);
};

export const mockCustomManifestFileResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  const sendContent = hasWizardSignal('CUSTOM_MANIFEST_ADDED');
  req.reply(sendContent ? fixtureMapping.manifestContent : '');
};

export const addCustomManifestsIntercepts = () => {
  cy.intercept('GET', `${allClustersApiPath}/*/manifests`, []).as('day2-flow-list-manifests');

  const day1ManifestsPath = `${allClustersApiPath}${Cypress.env('clusterId')}/manifests`;
  cy.intercept('GET', day1ManifestsPath, mockCustomManifestResponse).as('list-manifests');

  cy.intercept('PATCH', day1ManifestsPath, mockCustomManifestResponse).as('update-manifests');

  cy.intercept('POST', day1ManifestsPath, mockCustomManifestResponse).as('create-manifest');

  cy.intercept('DELETE', `${day1ManifestsPath}?folder=manifests&file_name=*`, {
    statusCode: 200,
    body: {},
  }).as('delete-manifests');

  cy.intercept(
    'GET',
    `${day1ManifestsPath}/files?folder=manifests&file_name=*`,
    mockCustomManifestFileResponse,
  ).as('info-manifest-with-content');
};
