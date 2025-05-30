import { commonActions } from '../../views/common';
import { staticIpPage } from '../../views/staticIpPage';

describe(`Assisted Installer Static IP Host specific Configuration`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
  };

  before(() => setTestStartSignal('STATIC_IP_NETWORK_WIDE_CONFIGURED'));

  beforeEach(() => {
    setTestStartSignal('STATIC_IP_NETWORK_WIDE_CONFIGURED');
    commonActions.visitClusterDetailsPage();
    commonActions.getWizardStepNav('Static network configurations').click();
  });

  it('Can be entered using Form View', () => {
    commonActions.toNextStaticIpStepAfter('Network-wide configurations');

    staticIpPage.getAddMoreHosts().should('be.disabled');
    staticIpPage.hostSpecificMacAddress(0).type('00:00:5e:00:53:af');
    staticIpPage.hostSpecificIpv4Address(0).type('192.168.2.38');

    staticIpPage.hostSpecificMacAddress(1).should('not.exist');
    staticIpPage.getAddMoreHosts().should('be.enabled');
    staticIpPage.getAddMoreHosts().click();
    staticIpPage.hostSpecificMacAddress(1).type('00:00:5e:00:53:ae');
    staticIpPage.hostSpecificIpv4Address(1).type('192.168.2.39');

    commonActions.verifyNextIsEnabled();
  });

  describe('Reading existing configuration in Form view', () => {
    beforeEach(() => {
      setTestStartSignal('STATIC_IP_HOST_SPECIFIC_CONFIGURED');
      commonActions.visitClusterDetailsPage();
      commonActions.getWizardStepNav('Static network configurations').click();
    });

    it('Can show the existing static IP configuration', () => {
      commonActions.getWizardStepNav('Host specific configurations').click();

      staticIpPage.hostMappingBlockToggle(0).click();
      staticIpPage.hostMappingIpv4Address(0).should('have.value', '192.168.3.28');
      staticIpPage
        .hostMappingIpv6Address(0)
        .should('have.value', '2345:0425:2CA1:0000:0000:0567:5673:23ba');
      staticIpPage.hostMappingMacAddress(0).should('have.value', '00:00:5e:00:53:a1');
      staticIpPage.hostMappingBlockToggle(0).click();

      staticIpPage.hostMappingBlockToggle(1).click();
      staticIpPage.hostMappingIpv4Address(1).should('have.value', '192.168.3.34');
      staticIpPage
        .hostMappingIpv6Address(1)
        .should('have.value', '2345:0425:2CA1:0000:0000:0567:5673:23b1');
      staticIpPage.hostMappingMacAddress(1).should('have.value', '00:00:5e:00:53:ae');
      staticIpPage.hostMappingBlockToggle(1).click();

      staticIpPage.hostMappingBlockToggle(2).click();
      staticIpPage.hostMappingIpv4Address(2).should('have.value', '192.168.3.37');
      staticIpPage
        .hostMappingIpv6Address(2)
        .should('have.value', '2345:0425:2CA1:0000:0000:0567:5673:23b3');
      staticIpPage.hostMappingMacAddress(2).should('have.value', '00:00:5e:00:53:af');
      staticIpPage.hostMappingBlockToggle(2).click();

      commonActions.verifyNextIsEnabled();
    });
  });
});
