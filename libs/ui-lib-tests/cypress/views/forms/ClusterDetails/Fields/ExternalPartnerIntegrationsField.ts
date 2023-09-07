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

  static findDropdownToggle() {
    return ExternalPartnerIntegrationsField.findDropdown().find(
      '[data-ouia-component-type="PF4/DropdownToggle"]',
    );
  }

  static findDropdownItemSelected(item: string) {
    return ExternalPartnerIntegrationsField.findDropdown().findByText(item);
  }

  static findDropdownItems() {
    ExternalPartnerIntegrationsField.findDropdown().click();
    return ExternalPartnerIntegrationsField.findDropdown().find(
      '.pf-c-dropdown__menu [role="menuitem"]',
    );
  }

  static findDropdownItem(platform: string) {
    ExternalPartnerIntegrationsField.findDropdown().click();
    return cy.findByRole('menuitem', { name: new RegExp(`${platform}`, 'i') });
  }

  static selectPlatform(platform: string) {
    ExternalPartnerIntegrationsField.findDropdown().click();
    ExternalPartnerIntegrationsField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`${platform}`, 'i') }).click();
    });
  }
}
