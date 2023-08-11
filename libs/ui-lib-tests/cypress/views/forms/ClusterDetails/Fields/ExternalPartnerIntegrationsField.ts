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

  static findDropdown() {
    return cy.get(ExternalPartnerIntegrationsField.alias).find('#form-input-platform-field');
  }

  static findDropdownItemSelected() {
    return ExternalPartnerIntegrationsField.findDropdown().find('.pf-c-dropdown__toggle-text');
  }

  static findDropdownItems() {
    ExternalPartnerIntegrationsField.findDropdown().click();
    return ExternalPartnerIntegrationsField.findDropdown().find(
      '.pf-c-dropdown__menu [role="menuitem"]',
    );
  }

  static selectPlatform(platform: string) {
    ExternalPartnerIntegrationsField.findDropdown().click();
    ExternalPartnerIntegrationsField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`${platform}`, 'i') }).click();
    });
  }
}
