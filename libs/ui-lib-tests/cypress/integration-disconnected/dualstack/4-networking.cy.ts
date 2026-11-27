import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import {
  dualStackNetworkingRequest,
  ipv4NetworkingRequest,
  ipv6SingleStackNetworkingRequest,
} from '../../fixtures/dualstack/requests';

describe(`Assisted Installer OVE Dualstack Networking`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_DUALSTACK',
      singleCluster: true,
    });
  };

  const openNetworkingStep = (activeSignal: string) => {
    setTestStartSignal(activeSignal);
    cy.visit(`/${fixtures.fakeClusterId}`);
    commonActions.startAtWizardStep('Networking');
  };

  describe('Cluster configured with Single Stack', () => {
    beforeEach(() => openNetworkingStep('NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK'));

    it('Networking is displayed correctly', () => {
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('be.checked');
      networkingPage.getSingleStackLabel().contains('Single stack');

      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage
        .getClusterSubnetCidrIpv4()
        .should('contain.text', '192.168.122.0/24 (192.168.122.0 - 192.168.122.255)');
    });

    it('Can switch to dual-stack', () => {
      networkingPage.getStackTypeDualStack().should('be.enabled').and('not.be.checked');
      networkingPage.getStackTypeDualStack().check();

      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getClusterManagedNetworking().should('be.disabled').and('be.checked');

      networkingPage
        .getClusterSubnetCidrIpv4()
        .contains('192.168.122.0/24 (192.168.122.0 - 192.168.122.255)');
      networkingPage
        .getClusterSubnetCidrIpv6()
        .contains('1001:db9::/120 (1001:db9:: - 1001:db9::ff)');

      networkingPage.inputApiVipIngressVipSecondary('1001:db9::1', '1001:db9::2');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(dualStackNetworkingRequest);
      });
    });
  });

  describe('Cluster configured with Dual Stack', () => {
    beforeEach(() => openNetworkingStep('NETWORKING_DUAL_STACK_SELECT_DUAL_STACK'));

    it('Networking is displayed correctly', () => {
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('not.be.checked');
      networkingPage.getClusterManagedNetworking().should('not.be.enabled').and('be.checked');

      networkingPage
        .getClusterSubnetCidrIpv4()
        .contains('192.168.122.0/24 (192.168.122.0 - 192.168.122.255)');
      networkingPage
        .getClusterSubnetCidrIpv6()
        .contains('1001:db9::/120 (1001:db9:: - 1001:db9::ff)');
    });

    it('Can switch to single-stack', () => {
      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').check();
      networkingPage.confirmStackTypeChange();

      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('be.checked');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(ipv4NetworkingRequest);
      });
    });
  });

  describe('Single stack allows IPv6', () => {
    beforeEach(() => openNetworkingStep('NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK'));

    it('Can select an IPv6 machine subnet and IPv6 VIP in single stack', () => {
      networkingPage.selectPrimaryMachineNetworkSubnet('1001:db9::/120');
      networkingPage
        .getClusterSubnetCidrIpv4()
        .should('contain.text', '1001:db9::/120 (1001:db9:: - 1001:db9::ff)');

      networkingPage.inputApiVipIngressVip('1001:db9::1', '1001:db9::2');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(
          ipv6SingleStackNetworkingRequest,
        );
      });
    });
  });
});
