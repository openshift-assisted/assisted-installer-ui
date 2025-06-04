export const bareMetalDiscoveryPage = {
  getAddHostsButton: () => {
    return cy.get(Cypress.env('hostInventoryDownloadDiscoveryIso'));
  },
  openAddHostsModal: () => {
    // This button is detached sometimes. We add extra guards to always be able to click it
    cy.get(Cypress.env('hostInventoryDownloadDiscoveryIso')).scrollIntoView().click();
  },
  getGenerateDay2IsoButton: () => {
    return cy.get(Cypress.env('bareMetalInventoryAddHostsButtonDownloadDiscoveryIso'));
  },
  setClusterIdFromUrl: () => {
    cy.url().then((url) => {
      const clusterId = url.split('/')[url.split('/').length - 1];
      Cypress.env('clusterId', clusterId);
    });
  },
  getCnvField: () => {
    return cy.get(Cypress.env('useContainerNativeVirtualizationField'));
  },
  getOdfOperator: () => {
    return cy.get(Cypress.env('useOpenShiftDataFoundation'));
  },
  platformIntegration: {
    getFullPotentialHint: () => {
      return cy.get('[data-testid="discover-platform-integration-hosts"]', { timeout: 16000 });
    },
    getToggleSwitch: () => {
      return cy.get('#form-input-usePlatformIntegration-field');
    },
  },
  waitForHostTablePopulation: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
    timeout = Cypress.env('HOST_REGISTRATION_TIMEOUT'),
  ) => {
    cy.get('table.hosts-table > tbody > tr:not([hidden])', { timeout: timeout }).should(($els) => {
      expect($els.length).to.be.eq(numMasters + numWorkers);
      if (numMasters + numWorkers === 1) {
        expect($els[0].textContent).not.to.contain('Waiting for host');
      }
    });
  },
  waitForHostRowToContain: (text, timeout = Cypress.env('HOST_DISCOVERY_TIMEOUT')) => {
    cy.get('table.hosts-table > tbody > tr', { timeout: timeout }).should('contain.text', text);
  },
  selectHostRowKebabAction: (rowIndex, actionItem) => {
    cy.get(
      `[data-testid=host-row-${rowIndex}] > td.pf-v6-c-table__action > button[aria-label="Kebab toggle"]`,
    )
      .scrollIntoView()
      .click({ force: true });
    cy.get('li').contains(actionItem).click({ force: true });
  },
  getHostTableMassActions: () => {
    return cy.get('.pf-v6-c-toolbar.table-toolbar');
  },
  getHostRowSelectCheckbox: (hostIndex = 0) => {
    return cy.get(`[data-testid=host-row-${hostIndex}]`).find('.pf-v6-c-check__input');
  },
  validateIsReadOnlyHostMenu: () => {
    cy.get(
      `[data-testid=host-row-0] > td.pf-v6-c-table__action > button[aria-label="Kebab toggle"]`,
    )
      .scrollIntoView()
      .click({
        force: true,
      });
    cy.get('li[role][id^=button-edit-host]').should('not.exist');
    cy.get('li[role][id^=button-delete-host]').should('not.exist');
  },
  massRenameHosts: (prefix) => {
    cy.get('.table-toolbar .pf-v6-c-menu-toggle__controls:first').click();
    cy.get('#select-all').click();
    cy.get('.table-toolbar .pf-v6-c-menu-toggle__controls:last').click();
    cy.get('.pf-v6-c-menu__content:last').within(() => {
      cy.get('.pf-v6-c-menu__item-text')
        .contains(Cypress.env('hostRowKebabMenuChangeHostnameText'))
        .click();
    });
    bareMetalDiscoveryPage.renameHost(`${prefix}-{{n}}`);
    bareMetalDiscoveryPage.clickSaveEditHostsForm();
  },
  getHostNameInput: () => {
    return cy.get(Cypress.env('hostnameFieldId'));
  },
  renameHost: (newHostName) => {
    bareMetalDiscoveryPage
      .getHostNameInput()
      .clear()
      .type(newHostName, { parseSpecialCharSequences: false });
    bareMetalDiscoveryPage.getHostNameInput().should('have.value', newHostName);
  },
  deleteHost: () => {
    cy.get('.pf-v6-c-modal-box__footer').should('be.visible');
    cy.get('.pf-v6-c-modal-box__footer').within(() => {
      cy.get(Cypress.env('deleteHostSubmit')).click();
    });
  },
  validateHostRowColumnValue: (hostRowIndex, columnDataTestId, value) => {
    cy.get(
      `[data-testid=host-row-${hostRowIndex}] > [data-testid=${columnDataTestId}] > .pf-m-align-items-center > .pf-l-flex > .pf-v6-c-button`,
    ).should('contain.text', value);
  },
  sortCpuAscending: () => {
    // first click will sort in Ascending order (lowest to highest)
    cy.get(`${Cypress.env('colHeaderCpuCoresId')} > .pf-v6-c-table__button`).click();
    cy.get(
      `${Cypress.env('colHeaderCpuCoresId')} > .pf-v6-c-table__button > div > span > svg > path`,
    )
      .invoke('attr', 'd')
      .should('contain.text', 'M88');
  },
  sortCpuDescending: () => {
    // second click will sort in Descending order (highest to lowest)
    cy.get(`${Cypress.env('colHeaderCpuCoresId')} > .pf-v6-c-table__button`).click();
    cy.get(
      `${Cypress.env('colHeaderCpuCoresId')} > .pf-v6-c-table__button > div > span > svg > path`,
    )
      .invoke('attr', 'd')
      .should('contain.text', 'M168');
  },
  clickSaveEditHostsForm: () => {
    cy.get('button[type=submit]').click();
    cy.get('.pf-v6-c-popover__content').should('not.exist');
  },
  clickCancelInFormFooter: () => {
    cy.get('.pf-v6-c-modal-box__footer').within(() => {
      cy.get(`button:contains('Cancel')`).click();
    });
  },
  clickChangeHostnameErrorIcon: () => {
    cy.get('.pf-v6-c-input-group > .pf-v6-c-button > svg > path').click();
  },
  clickMainBody: () => {
    cy.get('.pf-v6-c-wizard__main-body').click();
  },
};
