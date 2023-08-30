import { NewClusterPage } from '../../../views/pages/NewClusterPage';
import { ClusterDetailsForm } from '../../../views/forms/ClusterDetails/ClusterDetailsForm';
import { externalPlatformTypes } from '../../../fixtures/cluster/external-platform-types';
import { commonActions } from '../../../views/common';
import { pullSecret } from '../../../fixtures';
import { clusterDetailsPage } from '../../../views/clusterDetails';

describe('Create a new cluster with external partner integrations', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };
  before(() => setTestStartSignal(''));

  describe('When creating the cluster:', () => {
    beforeEach(() => {
      setTestStartSignal('');
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
      ClusterDetailsForm.externalPartnerIntegrationsField.findDropdownItemSelected(
        'No platform integration',
      );
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

    it('Validate that oracle as external partner integration is unselected in dropdown when IBM/Z(s390x) architecture is selected', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.externalPartnerIntegrationsField.selectPlatform('Oracle');
      ClusterDetailsForm.cpuArchitectureField.selectCpuArchitecture('s390x');
      ClusterDetailsForm.externalPartnerIntegrationsField.findDropdownItemSelected(
        'No platform integration',
      );
    });

    it('Validate that all dropdown is disabled in case we choose IBM/Z(s390x) architecture', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.14');
      ClusterDetailsForm.cpuArchitectureField.selectCpuArchitecture('s390x');
      ClusterDetailsForm.externalPartnerIntegrationsField
        .findDropdownToggle()
        .should('be.disabled');
    });

    it('Validate that Nutanix option is disabled in case we choose OCP version 4.10', () => {
      ClusterDetailsForm.openshiftVersionField.selectVersion('4.10');
      ClusterDetailsForm.externalPartnerIntegrationsField
        .findDropdownItem('Nutanix')
        .should('have.class', 'pf-m-aria-disabled');
    });

    it('Validate that Nutanix option is disabled when we choose SNO option', () => {
      ClusterDetailsForm.snoField.findCheckbox().click();
      ClusterDetailsForm.externalPartnerIntegrationsField
        .findDropdownItem('Nutanix')
        .should('have.class', 'pf-m-aria-disabled');
    });
  });

  describe('After the cluster is created', () => {
    beforeEach(() => {
      setTestStartSignal('CLUSTER_CREATED');
      commonActions.visitClusterDetailsPage();
      commonActions.startAtWizardStep('Cluster details');
    });

    it('Shows external platform integrations as a static field', () => {
      clusterDetailsPage
        .getExternalPlatformIntegrationStaticField()
        .should('have.text', 'No platform integration');
    });
  });
});
