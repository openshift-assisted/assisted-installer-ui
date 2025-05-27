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
    cy.get('td[data-testid="host-cpu-cores"]')
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
    cy.get('td[data-testid="host-memory"]')
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
    cy.get('td[data-testid="host-disks"]')
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
    cy.get('table.hosts-table > tbody > tr:not([hidden])').each((row) =>
      cy
        .wrap(row)
        .find('td[data-testid="host-hw-status"]', { timeout: Cypress.env('HOST_READY_TIMEOUT') })
        .should('contain.text', status),
    );
  },
  getHostDisksExpander: (hostIndex: number) => {
    return cy.get(`#expand-toggle${hostIndex}`);
  },
  getHostDetailsTitle: (hostIndex: number) => {
    return cy.get(`h3[data-testid="disks-section"]`).then((hostTables) => {
      return hostTables[hostIndex];
    });
  },
  validateHostDisksDetails: (disks) => {
    disks.forEach((disk) => {
      cy.get(
        `[data-testid="disk-row-${disk.id}-row${disk.row}"] [data-testid="drive-type"]`,
      ).should('contain', disk.type);
      cy.get(`[data-testid="disk-row-${disk.id}-row${disk.row}"] [data-testid="disk-size"]`).should(
        'contain',
        disk.size,
      );
    });
  },
  validateGroupingByDiskHolders: (disks: ValidateDiskHoldersParams, message?: string) => {
    cy.get('.pf-m-expanded td[data-testid="disk-name"]').then(($diskNames) => {
      disks.forEach((disk, index) => {
        cy.wrap($diskNames).eq(index).should('contain.text', disk.name);
        if (disk.indented || disk.warning) {
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
