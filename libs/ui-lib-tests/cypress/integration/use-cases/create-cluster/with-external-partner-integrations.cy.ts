import { NewClusterPage } from '../../../views/pages/NewClusterPage';
import { ClusterDetailsForm } from '../../../views/forms/ClusterDetails/ClusterDetailsForm';

describe('Create a new cluster with external partner integrations', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal(''));
  beforeEach(() => setTestStartSignal(''));

  xcontext('When the feature is disabled:', () => {
    // TODO(jkilzi): Find out how to mock the LibRouter store and features props.
    // This test case is disabled intentionally because it requires tweaking the
    // props passed to the LibRouter in the app.
    it('The user cannot see the external partner integrations checkbox', () => {
      // Disable somehow Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES.ASSISTED_INSTALLER_PLATFORM_OCI, and then...
      // ClusterDetailsForm.init().externalPartnerIntegrationsControl.findLabel().should('not.exist');
    });
  });

  context('When the feature is enabled:', () => {
    beforeEach(() => {
      NewClusterPage.visit();
      ClusterDetailsForm.init();
    });

    it('The user can select the external partner integrations checkbox', () => {
      ClusterDetailsForm.externalPartnerIntegrationsField.findLabel().click();
    });

    it('There is a popover and helper text next to the checkbox label', () => {
      ClusterDetailsForm.externalPartnerIntegrationsField.findPopoverButton().click();
      ClusterDetailsForm.externalPartnerIntegrationsField.findPopoverContent();
      ClusterDetailsForm.externalPartnerIntegrationsField.findHelperText();
    });

    it('Selecting external partner integrations checkbox enables custom manifests as well', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.findLabel().click();
      ClusterDetailsForm.customManifestsField
        .findCheckbox()
        .should('be.checked')
        .and('be.disabled');
    });

    it('External partner integrations checkbox is unselected after OCP < v4.14 is selected', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.findLabel().click();
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.13');
      ClusterDetailsForm.externalPartnerIntegrationsField.findCheckbox().should('not.be.checked');
    });

    it("Hosts' Network Configuration control is disabled when external partner integration is selected", () => {
      ClusterDetailsForm.hostsNetworkConfigurationField.findStaticIpRadioLabel().click();
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.findLabel().click();
      ClusterDetailsForm.hostsNetworkConfigurationField
        .findStaticIpRadioButton()
        .should('be.disabled')
        .and('not.be.checked');
    });

    xit('The minimal ISO is presented by default', () => {
      // TODO(jkilzi): WIP...
      // ClusterDetailsForm.clusterNameField
      //   .findInputField()
      //   .type(Cypress.env('CLUSTER_NAME'));
      // ClusterDetailsForm.baseDomainField.findInputField().scrollIntoView().type('redhat.com');
      // ClusterDetailsForm.openshiftVersionField.findInputField().scrollIntoView().type('redhat.com');
    });
  });
});
