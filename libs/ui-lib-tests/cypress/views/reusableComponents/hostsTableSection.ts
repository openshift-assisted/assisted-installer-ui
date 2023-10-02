export type ValidateDiskHoldersParams = { name: string; indented?: boolean; warning?: boolean }[];

const numMasters = (): number => Cypress.env('NUM_MASTERS');
const numWorkers = (): number => Cypress.env('NUM_WORKERS');

export const hostsTableSection = {
  validateHostNames: (hostNames = Cypress.env('requestedHostnames')) => {
    cy.get('[data-testid=host-name]')
      .should('have.length', numMasters() + numWorkers())
      .each((hostName, idx) => {
        expect(hostName).to.contain(hostNames[idx]);
      });
  },
  validateHostRoles: () => {
    cy.get('td[data-testid="host-role"]')
      .should('have.length', numMasters() + numWorkers())
      .each((hostRole, idx) => {
        const isMaster = idx <= numMasters() - 1;
        if (isMaster) {
          expect(hostRole).to.contain('Control plane node');
        } else {
          expect(hostRole).to.contain('Worker');
        }
      });
  },
  validateHostCpuCores: () => {
    cy.get('td[data-label="CPU Cores"]')
      .should('have.length', numMasters() + numWorkers())
      .each((hostCpuCores, idx) => {
        const isMaster = idx <= numMasters() - 1;
        if (isMaster) {
          expect(hostCpuCores).to.contain(Cypress.env('masterCPU'));
        } else {
          expect(hostCpuCores).to.contain(Cypress.env('workerCPU'));
        }
      });
  },
  validateHostMemory: () => {
    cy.get('td[data-label="Memory"]')
      .should('have.length', numMasters() + numWorkers())
      .each((hostMemory, idx) => {
        const isMaster = idx <= numMasters() - 1;
        if (isMaster) {
          expect(hostMemory).to.contain(Cypress.env('masterMemory'));
        } else {
          expect(hostMemory).to.contain(Cypress.env('workerMemory'));
        }
      });
  },
  validateHostDiskSize: (masterDiskTotalSize: number, workerDiskTotalSize: number) => {
    cy.get('td[data-label="Total storage"]')
      .should('have.length', numMasters() + numWorkers())
      .each((hostDisk, idx) => {
        const isMaster = idx <= numMasters() - 1;
        if (isMaster) {
          expect(hostDisk).to.contain(`${masterDiskTotalSize} GB`);
        } else {
          expect(hostDisk).to.contain(`${workerDiskTotalSize} GB`);
        }
      });
  },
  waitForHardwareStatus: (status: string) => {
    // Start at index 2 here because of selector
    for (let i = 2; i <= numMasters() + numWorkers() + 1; i++) {
      cy.hostDetailSelector(i, 'Status', Cypress.env('HOST_READY_TIMEOUT')).should(
        'contain.text',
        status,
      );
    }
  },
  getHostDisksExpander: (hostIndex: number) => {
    return cy.get(`#expandable-toggle${hostIndex * 2}`);
  },
  getHostDetailsTitle: (hostIndex: number) => {
    return cy.get(`h3[data-testid="disks-section"]`).then((hostTables) => {
      return hostTables[hostIndex];
    });
  },
  validateHostDisksDetails: (disks) => {
    disks.forEach((disk) => {
      cy.get(`[data-testid="disk-row-${disk.id}"] [data-testid="drive-type"]`).should(
        'contain',
        disk.type,
      );
      cy.get(`[data-testid="disk-row-${disk.id}"] [data-testid="disk-size"]`).should(
        'contain',
        disk.size,
      );
    });
  },
  validateGroupingByDiskHolders: (disks: ValidateDiskHoldersParams, message?: string) => {
    cy.get('td[data-testid="disk-name"]').then(($diskNames) => {
      disks.forEach((disk, index) => {
        cy.wrap($diskNames).eq(index).should('contain.text', disk.name);

        if (disk.indented) {
          cy.wrap($diskNames).eq(index).find('span').should('exist');
        } else {
          cy.wrap($diskNames).eq(index).find('span').should('not.exist');
        }

        if (disk.warning && message) {
          cy.wrap($diskNames).eq(index).find('svg').click();
          cy.get('[data-testid="disk-limitations-popover"').should('contain.text', message);
        }
      });
    });
  },
};
