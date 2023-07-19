import { clusterDetailsPage } from '../../../views/clusterDetails';
import ClusterDetailsForm from '../../../views/forms/ClusterDetailsForm';
import NewClusterPage from '../../../views/pages/NewClusterPage';

describe('Create a new cluster with external partner integrations', () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
  });

  xcontext('When the feature is disabled:', () => {
    // TODO(jkilzi): Find out how to mock the LibRouter store and features props.
    // This test case is disabled intentionally because it requires tweaking the
    // props passed to the LibRouter in the app.
    it('The user cannot see the external partner integrations checkbox', () => {
      // Disable somehow Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES.ASSISTED_INSTALLER_PLATFORM_OCI, then...
      // ClusterDetailsForm.externalPartnerIntegrationsControl.findLabel().should('not.exist');
    });
  });

  context('When the feature is enabled:', () => {
    beforeEach(() => {
      NewClusterPage.visit();
    });

    it('The user can select the external partner integrations checkbox', () => {
      ClusterDetailsForm.externalPartnerIntegrationsControl.findLabel().click();
    });

    it('There is a popover and helper text next to the checkbox label', () => {
      ClusterDetailsForm.externalPartnerIntegrationsControl.findPopoverButton().click();
      ClusterDetailsForm.externalPartnerIntegrationsControl.findPopoverContent();
      ClusterDetailsForm.externalPartnerIntegrationsControl.findHelperText();
    });

    it('Selecting external partner integrations checkbox enables custom manifests as well', () => {
      clusterDetailsPage.inputOpenshiftVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsControl.findLabel().click();
      ClusterDetailsForm.customManifestsControl.findCheckbox().should('be.checked');
    });

    it('External partner integrations checkbox is unselected after OCP < v4.14 is selected', () => {
      clusterDetailsPage.inputOpenshiftVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsControl.findLabel().click();
      clusterDetailsPage.inputOpenshiftVersion('4.13');
      ClusterDetailsForm.externalPartnerIntegrationsControl.findCheckbox().should('not.be.checked');
    });

    xit('The minimal ISO is presented by default', () => {
      // TODO(jkilzi): WIP...
      // ClusterDetailsForm.clusterNameControl
      //   .findInputField()
      //   .scrollIntoView()
      //   .type(Cypress.env('CLUSTER_NAME'));
      // ClusterDetailsForm.baseDomainControl.findInputField().scrollIntoView().type('redhat.com');
      // ClusterDetailsForm.openshiftVersionControl.findInputField().scrollIntoView().type('redhat.com');
    });
  });
});
