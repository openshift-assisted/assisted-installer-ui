import { transformBasedOnUIVersion } from '../../support/transformations';
import { commonActions } from '../../views/common';
import { staticIpPage } from '../../views/staticIpPage';

describe(`Assisted Installer Static IP YAML configuration`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
    transformBasedOnUIVersion();
    cy.visit('/test/');
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.getWizardStepNav('Static network configurations');
    staticIpPage.getYamlViewSelect().click();
  });

  describe('Configuring Static IP in YAML view', () => {
    it('Can configure static IP in YAML view', () => {
      staticIpPage.yamlView.getStartFromScratch().click();
      staticIpPage.yamlView.fileUpload().attachFile(`static-ip/files/test.yaml`);
      staticIpPage.yamlView.macAddress().type('00:00:5e:00:53:af');
      staticIpPage.yamlView.interface().type('interface1');

      commonActions.getNextButton().should('be.enabled');
    });
    it('Cannot upload a binary file', () => {
      staticIpPage.yamlView.getStartFromScratch().click();
      staticIpPage.yamlView.fileUpload().attachFile(`static-ip/files/img.png`);
      staticIpPage.yamlView.macAddress().type('00:00:5e:00:53:af');
      staticIpPage.yamlView.interface().type('interface1');

      commonActions.getDangerAlert().should('be.visible');
      commonActions.getNextButton().should('not.be.enabled');
    });
  });
});
