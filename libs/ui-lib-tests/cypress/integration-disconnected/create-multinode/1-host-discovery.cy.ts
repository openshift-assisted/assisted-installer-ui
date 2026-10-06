import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { hostsTableSection } from '../../views/hostsTableSection';

import * as utils from '../../support/utils';

const validateHostTableDetails = () => {
  Cypress.env('masterCPU', '8');
  Cypress.env('masterMemory', '33.20 GiB');

  hostsTableSection.validateHostCpuCores();
  hostsTableSection.validateHostDiskSize(12.88, 0);
  hostsTableSection.validateHostMemory();
  hostsTableSection.validateHostRoles();
};

describe(`Assisted Installer OVE Multinode Host discovery`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal: activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
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
        expect(response?.body).to.have.length(3);
        response?.body.forEach((host) => {
          expect(host).not.to.haveOwnProperty('cluster_id');
        });
        cy.wait(['@bind-host-1', '@bind-host-2', '@bind-host-3']).then(() => {
          utils.setLastWizardSignal('HOST_DISCOVERED_3');
          bareMetalDiscoveryPage.waitForHostTablePopulation(3, 0);
          validateHostTableDetails();
        });
      });
    });
  });

  describe('When all hosts are discovered', () => {
    beforeEach(() => {
      setTestStartSignal('HOST_DISCOVERED_3');
    });

    it('Should mass-rename the hosts and be able to continue', () => {
      const hostPrefix = Cypress.env('HOST_RENAME');
      bareMetalDiscoveryPage.waitForHostTablePopulation(3, 0);
      bareMetalDiscoveryPage.massRenameHosts(hostPrefix);
      cy.wait(['@rename-host-1', '@rename-host-2', '@rename-host-3']).then(() => {
        utils.setLastWizardSignal('HOST_RENAMED_3');
        hostsTableSection.waitForHardwareStatus('Ready');
        hostsTableSection.validateHostNames([
          `${hostPrefix}-1`,
          `${hostPrefix}-2`,
          `${hostPrefix}-3`,
        ]);
      });
      commonActions.verifyNextIsEnabled();
      commonActions.toNextStepAfter('Host discovery');
      commonActions.verifyIsAtStep('Storage');
    });
  });
});
