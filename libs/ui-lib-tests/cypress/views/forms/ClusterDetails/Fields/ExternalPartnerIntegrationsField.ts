export class ExternalPartnerIntegrationsField {
  static readonly alias = `@${ExternalPartnerIntegrationsField.name}`;
  static readonly selector = '#form-control__form-input-platform-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ExternalPartnerIntegrationsField.selector, ancestorAlias).as(
      ExternalPartnerIntegrationsField.name,
    );
    return ExternalPartnerIntegrationsField;
  }

  static findLabel() {
    return cy
      .get(ExternalPartnerIntegrationsField.alias)
      .findByText(/integrate with external partner platforms/i);
  }

  static findExternalPartnerIntegrationsField() {
    return cy.get('#form-input-platform-field');
  }

  static findDropdown() {
    return cy.get('#form-input-platform-field-dropdown');
  }

  static findDropdownItemSelected(item: string) {
    return ExternalPartnerIntegrationsField.findExternalPartnerIntegrationsField().findByText(item);
  }

  static findDropdownItems() {
    ExternalPartnerIntegrationsField.findExternalPartnerIntegrationsField().click();
    return ExternalPartnerIntegrationsField.findDropdown().find('.pf-v6-c-menu__item');
  }

  static findDropdownItem(platform: string) {
    ExternalPartnerIntegrationsField.findExternalPartnerIntegrationsField().click();
    return ExternalPartnerIntegrationsField.findDropdown().find(`#${platform.toLowerCase()}`);
  }

  static selectPlatform(platform: string) {
    ExternalPartnerIntegrationsField.findExternalPartnerIntegrationsField().click();
    ExternalPartnerIntegrationsField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`${platform}`, 'i') }).click();
    });
  }

  static checkPlatformTechSupportLevel() {
    return cy
      .get(`[data-testid="EXTERNAL_PLATFORM_OCI-support-level"]`)
      .should('be.visible')
      .should('contain.text', Cypress.env('techPreviewSupportLevel'));
  }

  static checkPlatformDevSupportLevel() {
    return cy
      .get(`[data-testid="EXTERNAL_PLATFORM_OCI-support-level"]`)
      .should('be.visible')
      .should('contain.text', Cypress.env('devPreviewSupportLevel'));
  }
}
