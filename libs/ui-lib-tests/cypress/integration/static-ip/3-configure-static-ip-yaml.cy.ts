import { commonActions } from '../../views/common';
import { staticIpPage } from '../../views/staticIpPage';

describe(`Assisted Installer Static IP YAML configuration`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
  };

  describe('Configuring static IP in YAML view', () => {
    before(() => setTestStartSignal(''));

    beforeEach(() => {
      setTestStartSignal('');
      commonActions.visitClusterDetailsPage();
      commonActions.getWizardStepNav('Static network configurations').click();
      staticIpPage.getYamlViewSelect().click();
    });

    it('Can configure static IP in YAML view', () => {
      staticIpPage.yamlView.getStartFromScratch().click();
      staticIpPage.yamlView.fileUpload().attachFile(`static-ip/files/test.yaml`);
      staticIpPage.yamlView.macAddress().type('00:00:5e:00:53:af');
      staticIpPage.yamlView.interface().type('interface1');

      commonActions.verifyNextIsEnabled();
    });

    it('Can add another host configuration', () => {
      staticIpPage.yamlView.addHostConfigurationControl().should('exist'); //'be.disabled');

      staticIpPage.yamlView.getStartFromScratch().click();
      staticIpPage.yamlView.fileUpload().attachFile(`static-ip/files/test.yaml`);
      staticIpPage.yamlView.macAddress().type('00:00:5e:00:53:af');
      staticIpPage.yamlView.interface().type('interface1');

      staticIpPage.yamlView.copyConfigurationControl().should('be.checked');
      staticIpPage.yamlView.addHostConfigurationControl().click();

      staticIpPage.yamlView.macAddress(1, 0).should('be.visible').should('have.value', '');
      staticIpPage.yamlView.interface(1, 0).should('be.visible').should('have.value', '');

      staticIpPage.yamlView.macAddress(1, 0).type('00:00:5e:00:53:ae');
      staticIpPage.yamlView.interface(1, 0).type('interface2');

      commonActions.verifyNextIsEnabled();
    });

    it('Cannot upload a binary file', () => {
      staticIpPage.yamlView.getStartFromScratch().click();
      staticIpPage.yamlView.fileUpload().attachFile(`static-ip/files/img.png`);
      staticIpPage.yamlView.macAddress().type('00:00:5e:00:53:af');
      staticIpPage.yamlView.interface().type('interface1');

      commonActions.getDangerAlert().should('be.visible');
      commonActions.verifyNextIsDisabled();
    });
  });

  describe('Reading existing configuration in YAML view', () => {
    before(() => setTestStartSignal('STATIC_IP_YAML_CONFIGURED'));

    beforeEach(() => {
      setTestStartSignal('STATIC_IP_YAML_CONFIGURED');
      commonActions.visitClusterDetailsPage();
      commonActions.getWizardStepNav('Static network configurations').click();
    });

    it('Can show the correct type view', () => {
      commonActions.verifyIsAtStep('Static network configurations');
    });

    it('Can show the existing static IP configuration', () => {
      staticIpPage.yamlView.getStartFromScratch().should('not.exist');
      staticIpPage.yamlView.interface().should('have.value', 'interface1');
      staticIpPage.yamlView.macAddress().should('have.value', '00:00:5e:00:53:af');
    });
  });
});
