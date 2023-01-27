export const hostsTableSection = {
  validateHostNames: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
    hostNames = Cypress.env('requestedHostnames'),
  ) => {
    cy.get(Cypress.env('hostnameDataTestId'))
      .should('have.length', numMasters + numWorkers)
      .each((hostName, idx) => {
        expect(hostName).to.contain(hostNames[idx]);
      });
  },
  validateHostRoles: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get(Cypress.env('roleDataLabel'))
      .should('have.length', numMasters + numWorkers)
      .each((hostRole, idx) => {
        const isMaster = idx <= numMasters - 1;
        if (isMaster) {
          expect(hostRole).to.contain(Cypress.env('HOST_ROLE_MASTER_LABEL'));
        } else {
          expect(hostRole).to.contain(Cypress.env('HOST_ROLE_WORKER_LABEL'));
        }
      });
  },
  validateHostCpuCores: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get(Cypress.env('cpuCoresDataLabel'))
      .should('have.length', numMasters + numWorkers)
      .each((hostCpuCores, idx) => {
        const isMaster = idx <= numMasters - 1;
        if (isMaster) {
          expect(hostCpuCores).to.contain(Cypress.env('masterCPU'));
        } else {
          expect(hostCpuCores).to.contain(Cypress.env('workerCPU'));
        }
      });
  },
  validateHostMemory: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get(Cypress.env('memoryDataLabel'))
      .should('have.length', numMasters + numWorkers)
      .each((hostMemory, idx) => {
        const isMaster = idx <= numMasters - 1;
        if (isMaster) {
          expect(hostMemory).to.contain(Cypress.env('masterMemory'));
        } else {
          expect(hostMemory).to.contain(Cypress.env('workerMemory'));
        }
      });
  },
  validateHostDiskSize: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get(Cypress.env('totalStorageDataLabel'))
      .should('have.length', numMasters + numWorkers)
      .each((hostDisk, idx) => {
        const isMaster = idx <= numMasters - 1;
        if (isMaster) {
          expect(hostDisk).to.contain(Cypress.env('masterDiskTotalSize'));
        } else {
          expect(hostDisk).to.contain(Cypress.env('workerDiskTotalSize'));
        }
      });
  },
  waitForHardwareStatus: (
    status,
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
    timeout = Cypress.env('HOST_READY_TIMEOUT'),
  ) => {
    // Start at index 2 here because of selector
    for (let i = 2; i <= numMasters + numWorkers + 1; i++) {
      cy.hostDetailSelector(i, 'Status', timeout).should('contain', status);
    }
  },
  getHostDetails: (hostIndex: number) => {
    return cy.get(`#expandable-toggle${hostIndex * 2}`);
  },
  getHostDetailsTitle: (hostIndex: number) => {
    return cy.get(`#expanded-content${hostIndex * 2 + 1} h3`);
  },
  validateHostDisksDetails: (disks) => {
    disks.forEach((disk) => {
      cy.get(`[data-testid="disk-row-${disk.id}"] [data-testid="drive-type"]`).should('contain', disk.type);
      cy.get(`[data-testid="disk-row-${disk.id}"] [data-testid="disk-size"]`).should('contain', disk.size);
    });
  },
};
