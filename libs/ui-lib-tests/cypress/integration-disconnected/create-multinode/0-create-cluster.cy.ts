import * as fixtures from '../../fixtures';
import { utils } from '../../support';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { commonActions } from '../../views/common';

describe('Assisted Disconnected UI', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
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

    cy.url().should('eq', Cypress.config().baseUrl + '/');

    commonActions.verifyIsAtStep('Cluster details');

    clusterDetailsPage.inputClusterName();
    clusterDetailsPage.inputBaseDnsDomain();

    commonActions.verifyNextIsEnabled();
    commonActions.toNextStepAfter('Cluster details');

    cy.wait('@create-cluster').then(({ request }) => {
      expect(request.body).to.deep.equal({
        name: 'ai-ove-mno',
        base_dns_domain: 'redhat.com',
        control_plane_count: 3,
        cpu_architecture: 'x86_64',
        disk_encryption: { mode: 'tpmv2', enable_on: 'none' },
        openshift_version: '4.21.27',
        pull_secret: fixtures.pullSecret,
      });
    });

    cy.url().should('eq', Cypress.config().baseUrl + '/' + fixtures.fakeClusterId);
    commonActions.verifyIsAtStep('Operators');
  });
});
