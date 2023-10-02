import { commonActions } from '../../views/pages/common';
import { staticIpPage } from '../../views/forms/StaticIP/staticIpPage';
import testIpv4AndIpv6Addresses from '../../fixtures/data/ipv4-and-ipv6-addresses';

type NetworkSelection = 'ipv4' | 'dual-stack';
const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

const machineNetworkPrefix = '20';
const dnsText = '192.168.1.45';

const ipv4Fields = {
  machineNetwork: '192.168.1.13',
  gateway: '192.168.1.32',
};

const ipv6Fields = {
  machineNetwork: '2340::',
  gateway: '2340::f',
};

const validateStaticIpRequest = (requestBody, ipVersion: NetworkSelection) => {
  const submitYaml = requestBody.static_network_config[0].network_yaml;
  let count = 0;
  const includedValues =
    ipVersion === 'ipv4'
      ? [dnsText, ipv4Fields.gateway, ipv4Fields.machineNetwork]
      : [
          dnsText,
          ipv4Fields.gateway,
          ipv4Fields.machineNetwork,
          ipv6Fields.gateway,
          ipv6Fields.machineNetwork,
        ];
  includedValues.forEach((includedValue) => {
    expect(submitYaml).to.contain(includedValue);
    count++;
  });
  expect(count).to.eq(includedValues.length);
};

const fillStaticIpForm = (networkSelection: NetworkSelection, fields) => {
  const ipVersion = networkSelection === 'dual-stack' ? 'ipv6' : 'ipv4';
  staticIpPage.networkWideMachineNetwork(ipVersion).type(fields.machineNetwork);
  staticIpPage.networkWideMachineNetworkPrefix(ipVersion).type(machineNetworkPrefix);
  staticIpPage.networkWideMachineGateway(ipVersion).type(fields.gateway);
};

describe(`Assisted Installer Static IP Network wide Configuration`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
  };

  before(() => setTestStartSignal('STATIC_IP_ENABLED'));

  describe('Configuring Static IP in Form view', () => {
    beforeEach(() => {
      setTestStartSignal('STATIC_IP_ENABLED');
      commonActions.visitClusterDetailsPage();
      commonActions.getWizardStepNav('Static network configurations').click();
    });

    it('Can configure single stack static IP', () => {
      commonActions
        .getWizardStepNav('Network-wide configurations')
        .should('have.class', ACTIVE_NAV_ITEM_CLASS);
      commonActions
        .getWizardStepNav('Host specific configurations')
        .should('not.have.class', ACTIVE_NAV_ITEM_CLASS);

      commonActions.verifyNextIsDisabled();
      staticIpPage.networkWideDns().type(dnsText);
      fillStaticIpForm('ipv4', ipv4Fields);

      commonActions.getDangerAlert().should('not.exist');
      commonActions.verifyNextIsDisabled(); // auto-save is triggered

      cy.wait('@update-infra-env').then(({ request }) => {
        validateStaticIpRequest(request.body, 'ipv4');
        commonActions.verifyNextIsEnabled();
      });
    });

    it('Can configure dual stack Static IP', () => {
      staticIpPage.dualStackNetworking().click();

      commonActions.verifyNextIsDisabled();
      staticIpPage.networkWideDns().type(dnsText);
      fillStaticIpForm('ipv4', ipv4Fields);
      fillStaticIpForm('dual-stack', ipv6Fields);

      commonActions.getDangerAlert().should('not.exist');
      commonActions.verifyNextIsDisabled(); // auto-save is triggered

      cy.wait('@update-infra-env').then(({ request }) => {
        validateStaticIpRequest(request.body, 'dual-stack');
      });

      commonActions.verifyNextIsEnabled();
      commonActions.toNextStaticIpStepAfter('Network-wide configurations');

      commonActions
        .getWizardStepNav('Network-wide configurations')
        .should('not.have.class', ACTIVE_NAV_ITEM_CLASS);
      commonActions
        .getWizardStepNav('Host specific configurations')
        .should('have.class', ACTIVE_NAV_ITEM_CLASS);
    });

    it('[nrt] Can use IPv4 and IPv6 on DNS when dual stack', () => {
      staticIpPage.dualStackNetworking().click();

      testIpv4AndIpv6Addresses.forEach((dnsEntry) => {
        staticIpPage.networkWideDns().type(dnsEntry);
        commonActions.getDNSErrorMessage().should('not.exist');
        staticIpPage.networkWideDns().clear();
      });
    });
  });

  describe('Reading existing configuration in Form view', () => {
    beforeEach(() => {
      setTestStartSignal('STATIC_IP_NETWORK_WIDE_CONFIGURED');
      commonActions.visitClusterDetailsPage();
      commonActions.getWizardStepNav('Static network configurations').click();
    });

    it('Can show the existing static IP configuration', () => {
      staticIpPage.dualStackNetworking().should('not.be.checked');
      staticIpPage.useVlan().should('not.be.checked');
      staticIpPage.vlanField().should('not.exist');
      staticIpPage.networkWideDns().should('have.value', '192.168.1.22');

      staticIpPage.networkWideMachineNetwork('ipv4').should('have.value', '192.168.1.222');
      staticIpPage.networkWideMachineNetworkPrefix('ipv4').should('have.value', '11');
      staticIpPage.networkWideMachineGateway('ipv4').should('have.value', '192.168.1.224');
    });
  });
});
