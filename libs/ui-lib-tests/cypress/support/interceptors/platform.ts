import { HttpRequestInterceptor } from 'cypress/types/net-stubbing';

import * as fixtures from '../../fixtures';
import { allClustersApiPath } from './utils';

export const mockSupportedPlatformsResponse: HttpRequestInterceptor = (req) => {
  const platforms = Cypress.env('AI_SUPPORTED_PLATFORMS') || ['none'];
  req.reply(platforms);
};

export const addPlatformFeatureIntercepts = () => {
  cy.intercept('GET', '/api/assisted-install/v2/openshift-versions*', (req) => {
    const versions = Cypress.env('AI_SINGLE_CLUSTER')
      ? fixtures.oveVersions
      : fixtures.openShiftVersions;

    req.reply({
      body: versions,
    });
  }).as('openshift-versions');

  cy.intercept('GET', `/api/assisted-install/v2/support-levels/features*`, (req) => {
    // This request can also have cpu_architecture in the query, for now we always assume x86_64
    const openshiftVersion = (req.query.openshift_version as string) || '';
    const cpuArchitecture = (req.query.cpu_architecture as string) || 'x86_64';
    const shortOpenshiftVersion = openshiftVersion.split('.').slice(0, 2).join('.');
    if (cpuArchitecture === 's390x') {
      req.reply(
        fixtures.featureSupportLevels[shortOpenshiftVersion.concat('_').concat(cpuArchitecture)],
      );
    } else {
      req.reply(fixtures.featureSupportLevels[shortOpenshiftVersion]);
    }
  }).as('feature-support-levels');

  // Calls that are requested for a particular cluster, the same response is returned for all clusters
  cy.intercept(
    'GET',
    `${allClustersApiPath}/*/supported-platforms`,
    mockSupportedPlatformsResponse,
  ).as('supported-platforms');
};
