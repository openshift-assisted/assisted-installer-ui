import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import { hasWizardSignal } from '../utils';
import * as fixtures from '../../fixtures';
import {
  allClustersApiPath,
  getDay1ClusterApiPath,
  getDay1ClusterPreflightRequirementsApiPath,
  getScenarioFixtureMapping,
  transformClusterFixture,
} from './utils';

export const mockClusterResponse: HttpRequestInterceptor = (req) => {
  const fixtureMapping = getScenarioFixtureMapping();
  if (fixtureMapping?.clusters) {
    req.reply(transformClusterFixture(fixtureMapping));
  } else {
    throw new Error(
      'Incorrect fixture mapping for scenario ' + ((Cypress.env('AI_SCENARIO') as string) || ''),
    );
  }
};

export const mockClusterErrorResponse: HttpRequestInterceptor = (req) => {
  req.reply({
    statusCode: 400,
    body: {
      code: '400',
      href: '',
      id: 400,
      kind: 'Error',
      reason: 'This is an error response',
    },
  });
};

export const mockUISettingsResponse: HttpRequestInterceptor = (req) => {
  if (hasWizardSignal('CUSTOM_MANIFEST_ADDED')) {
    req.reply('AI_UI:{"customManifestsAdded":true}');
  } else if (hasWizardSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED')) {
    req.reply('AI_UI:{}');
  } else {
    req.reply('""');
  }
};

export const addClusterCreationIntercepts = () => {
  cy.intercept('POST', allClustersApiPath, mockClusterResponse).as('create-cluster');
};

export const addClusterListIntercepts = () => {
  cy.intercept('GET', allClustersApiPath, (req) => {
    const { initialClusterList, updatedClusterList } = fixtures;

    let fixture = Cypress.env('AI_SINGLE_CLUSTER') ? [] : initialClusterList;
    if (hasWizardSignal('CLUSTER_CREATED')) {
      fixture = updatedClusterList();
    }
    req.reply(fixture);
  }).as('clusters');
};

export const addPreflightRequirementsIntercepts = () => {
  const clusterReqApiPath = getDay1ClusterPreflightRequirementsApiPath();
  cy.intercept('GET', clusterReqApiPath, {
    operators: [
      {
        operatorName: 'mtv',
        dependencies: ['cnv'],
      },
      {
        operatorName: 'cnv',
        dependencies: ['lso'],
      },
    ],
  }).as('cluster-req');
};

export const addClusterPatchAndDetailsIntercepts = () => {
  const clusterApiPath = getDay1ClusterApiPath();
  cy.intercept('GET', clusterApiPath, mockClusterResponse).as('cluster-details');

  cy.intercept('PATCH', clusterApiPath, (req) => {
    if (Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH') === true) {
      throw new Error(`Forbidden patch: ${req.url} \n${JSON.stringify(req.body)}`);
    }

    req.alias = 'update-cluster';
    if (Cypress.env('AI_ERROR_CLUSTER_PATCH') === true) {
      mockClusterErrorResponse(req);
    } else {
      mockClusterResponse(req);
    }
  });

  cy.intercept('GET', `${clusterApiPath}/ui-settings`, mockUISettingsResponse).as('ui-settings');
  cy.intercept('PUT', `${clusterApiPath}/ui-settings`, '""').as('update-ui-settings');
};
