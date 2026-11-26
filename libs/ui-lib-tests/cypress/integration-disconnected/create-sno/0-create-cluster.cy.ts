import * as fixtures from '../../fixtures';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { commonActions } from '../../views/common';

describe('Assisted Disconnected UI Single node Cluster Installation', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_SINGLENODE',
      singleCluster: true,
    });
  };

  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    cy.visit('/');
  });

  it('renders the single-cluster create wizard at /', () => {
    cy.wait('@infra-envs');
    cy.wait('@clusters');
    cy.wait('@openshift-versions');

    cy.url().should('eq', Cypress.config().baseUrl + '/');

    commonActions.verifyIsAtStep('Cluster details');

    clusterDetailsPage.inputClusterName();
    clusterDetailsPage.inputBaseDnsDomain();
    clusterDetailsPage.getPullSecretCheckbox().should('not.be.checked');

    clusterDetailsPage.getStaticOpenShiftVersion().should('include.text', 'OpenShift 4.22.21');
    clusterDetailsPage.selectControlPlaneNodeOption(1);

    commonActions.verifyNextIsEnabled();
    commonActions.toNextStepAfter('Cluster details');

    cy.wait('@create-cluster').then(({ request }) => {
      expect(request.body).to.deep.equal({
        name: 'ai-ove-sno',
        base_dns_domain: 'redhat.com',
        control_plane_count: 1,
        cpu_architecture: 'x86_64',
        disk_encryption: { mode: 'tpmv2', enable_on: 'none' },
        openshift_version: '4.22.21',
        pull_secret: fixtures.pullSecret,
      });
    });

    cy.url().should('eq', Cypress.config().baseUrl + '/' + fixtures.fakeClusterId);
    commonActions.verifyIsAtStep('Operators');
  });
});
