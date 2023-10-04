import { commonActions as common } from '../../views/pages/common';
import { ClusterDetailsForm } from '../../views/forms/ClusterDetails/ClusterDetailsForm';
import { NewClusterPage } from '../../views/pages/NewClusterPage';

describe(`Assisted Installer Multinode Cluster Installation`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    cy.visit('/clusters');
  });

  describe('Creating a new cluster', () => {
    it('Can submit the form to create a new cluster', () => {
      NewClusterPage.visit();

      ClusterDetailsForm.clusterName().input();
      ClusterDetailsForm.baseDomain().dnsCheckbox().check();
      ClusterDetailsForm.openshiftVersion().select();
      ClusterDetailsForm.pullSecret().input();

      common.getInfoAlert().should('not.exist');
      common.toNextStepAfter('Cluster details');

      cy.wait('@create-cluster').then(({ request }) => {
        expect(request.body).not.to.deep.equal({});
        expect(Object.keys(request.body)).not.to.contain('platform');
      });
      cy.wait('@create-infra-env').then(({ request }) => {
        expect(request).not.to.deep.equal({});
      });

      common.toNextStepAfter('Operators');
    });
  });
});
