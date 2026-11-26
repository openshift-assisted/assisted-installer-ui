import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { hostsTableSection } from '../../views/hostsTableSection';

import * as utils from '../../support/utils';

const validateHostTableDetails = () => {
  Cypress.expose('masterCPU', '8');
  Cypress.expose('masterMemory', '33.20 GiB');

  hostsTableSection.validateHostCpuCores();
  hostsTableSection.validateHostDiskSize(12.88, 0);
  hostsTableSection.validateHostMemory();
  hostsTableSection.validateHostRoles();
};

describe(`Assisted Installer OVE SNO Host discovery`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal: activeSignal,
      activeScenario: 'AI_OVE_CREATE_SINGLENODE',
      singleCluster: true,
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
    cy.visit(`/${fixtures.fakeClusterId}`);
  });

  describe('Binding hosts', () => {
    it('Should bind available hosts', () => {
      commonActions.verifyIsAtStep('Host discovery');
      bareMetalDiscoveryPage.getAddHostsButton().should('not.exist');

      cy.wait('@get-hosts').then(({ response }) => {
        expect(response?.body).to.have.length(1);
        response?.body.forEach((host) => {
          expect(host).not.to.haveOwnProperty('cluster_id');
        });
        cy.wait(['@bind-host-1']).then(() => {
          utils.setLastWizardSignal('HOST_DISCOVERED_1');
          bareMetalDiscoveryPage.waitForHostTablePopulation(1, 0);
          validateHostTableDetails();
        });
      });
    });
  });

  describe('When all hosts are discovered', () => {
    beforeEach(() => {
      setTestStartSignal('HOST_DISCOVERED_1');
    });

    it('Should mass-rename the hosts and be able to continue', () => {
      const hostPrefix = Cypress.expose('HOST_RENAME');
      bareMetalDiscoveryPage.waitForHostTablePopulation(1, 0);

      bareMetalDiscoveryPage.selectHostRowKebabAction(
        0,
        Cypress.expose('hostRowKebabMenuChangeHostnameText'),
      );
      bareMetalDiscoveryPage.renameHost(hostPrefix);
      bareMetalDiscoveryPage.clickSaveEditHostsForm();

      cy.wait(['@rename-host-1']).then(() => {
        utils.setLastWizardSignal('HOST_RENAMED_1');
        hostsTableSection.waitForHardwareStatus('Ready');
        hostsTableSection.validateHostNames([`${hostPrefix}-1`]);
      });
      commonActions.verifyNextIsEnabled();
      commonActions.toNextStepAfter('Host discovery');
      commonActions.verifyIsAtStep('Storage');
    });
  });
});
