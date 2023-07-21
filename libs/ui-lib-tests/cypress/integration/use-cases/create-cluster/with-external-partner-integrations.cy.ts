import { NewClusterPage } from '../../../views/pages/NewClusterPage';
import { ClusterDetailsForm } from '../../../views/forms/ClusterDetails/ClusterDetailsForm';
import { externalPlatformTypes } from '../../../fixtures/cluster/external-platform-types';
import { commonActions } from '../../../views/common';
import { pullSecret } from '../../../fixtures';

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

    it('Should display correct items in the external platform integration dropdown', () => {
      ClusterDetailsForm.externalPartnerIntegrationsField.findDropdownItems().each((item) => {
        // Get the expected values from the externalPlatformTypes object
        const platformType = item.parent().attr('id');
        const { label, href } = externalPlatformTypes[platformType];

        // Assert the label
        cy.wrap(item).should('contain', label);
      });
    });

    it('Can select one external platform integration option and cluster is created well', () => {
      ClusterDetailsForm.clusterNameField.findInputField().type(Cypress.env('CLUSTER_NAME'));
      ClusterDetailsForm.baseDomainField.findInputField().type('redhat.com');
      ClusterDetailsForm.pullSecretField.inputPullSecret(pullSecret);
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.selectPlatform('Nutanix');
      commonActions.verifyNextIsEnabled();
      commonActions.toNextStepAfter('Cluster details');

      cy.wait('@create-cluster').then(({ request }) => {
        expect(request.body.platform.type.valueOf()).to.deep.equal('nutanix');
      });
    });

    it('Selecting oracle as external partner integration enables custom manifests as well', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.selectPlatform('Oracle');
      ClusterDetailsForm.customManifestsField
        .findCheckbox()
        .should('be.checked')
        .and('be.disabled');
    });

    it('Validate that oracle as external partner integration is unselected in dropdown after OCP < v4.14 is selected', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.selectPlatform('Oracle');
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.13');
      ClusterDetailsForm.externalPartnerIntegrationsField
        .findDropdownItemSelected()
        .contains('No platform integration');
    });

    it("Hosts' Network Configuration control is disabled when external partner integration is selected", () => {
      ClusterDetailsForm.hostsNetworkConfigurationField.findStaticIpRadioLabel().click();
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.selectPlatform('Oracle');
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
