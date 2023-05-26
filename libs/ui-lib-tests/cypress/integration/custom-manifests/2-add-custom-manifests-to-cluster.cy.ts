import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { transformBasedOnUIVersion } from '../../support/transformations';
import { clusterListPage } from '../../views/clusterList';
import * as utils from '../../support/utils';

describe(`Adding Custom Manifests`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'CLUSTER_CREATED',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });

  describe('Adding custom manifests', () => {
    it('Fill dummy custom manifest', () => {
      commonActions.startAtCustomManifestsStep();
    });

    it('Lists the new cluster', () => {
      cy.visit('/clusters');
      clusterListPage.getClusterByName().should('be.visible');
    });
  });
});
