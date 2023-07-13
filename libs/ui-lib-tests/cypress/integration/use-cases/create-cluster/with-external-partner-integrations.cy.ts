import { externalPlatformTypes } from '../../../fixtures/cluster/external-platform-types';
import { utils } from '../../../support';
import { clusterDetailsPage } from '../../../views/clusterDetails';
import { commonActions } from '../../../views/common';
import ClusterDetailsForm from '../../../views/forms/ClusterDetailsForm';
import NewClusterPage from '../../../views/pages/NewClusterPage';

describe('Create a new cluster with external platform integration dropdown', () => {
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
    it('The user cannot see the external partner integrations oracle option', () => {
      // Disable somehow Features.STANDALONE_DEPLOYMENT_ENABLED_FEATURES.ASSISTED_INSTALLER_PLATFORM_OCI, then...
      // ClusterDetailsForm.externalPartnerIntegrationsControl.findLabel().should('not.exist');
    });
  });

  context('When the feature is enabled:', () => {
    beforeEach(() => {
      NewClusterPage.visit();
    });

    it('Should display correct items in the external platform integration dropdown', () => {
      ClusterDetailsForm.externalPartnerIntegrationsControl.platformIntegrationDropdownButton.click();
      ClusterDetailsForm.externalPartnerIntegrationsControl.platformIntegrationDropdownItems.each(
        (item, index) => {
          // Get the expected values from the externalPlatformTypes object
          const platformType = item.parent().attr('id');
          const { label, href, tooltip } = externalPlatformTypes[platformType];

          // Assert the label
          cy.wrap(item).should('contain', label);

          // Assert the href
          if (href) {
            cy.wrap(item)
              .find('a')
              .should('have.attr', 'href', href)
              .and('have.attr', 'target', '_blank')
              .and('have.attr', 'rel', 'noopener noreferrer');
          } else {
            cy.wrap(item).find('a').should('not.exist');
          }
        },
      );
    });

    it('Can select one platform option and next option is enabled', () => {
      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.inputBaseDnsDomain();
      clusterDetailsPage.inputOpenshiftVersion();

      clusterDetailsPage.inputPullSecret();

      ClusterDetailsForm.externalPartnerIntegrationsControl.platformIntegrationDropdownButton.click();
      ClusterDetailsForm.externalPartnerIntegrationsControl
        .getPlatformIntegrationDropdownItemById('nutanix')
        .click();
      commonActions.verifyNextIsEnabled();
    });

    //TODO (mortegag) : Add tests for options disabled and tooltips
  });
});
