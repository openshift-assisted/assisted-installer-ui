export class ExternalPartnerIntegrationsField {
  static readonly alias = `@${ExternalPartnerIntegrationsField.name}`;
  static readonly selector = '#form-control__form-checkbox-externalPartnerIntegrations-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ExternalPartnerIntegrationsField.selector, ancestorAlias).as(
      ExternalPartnerIntegrationsField.name,
    );
    return ExternalPartnerIntegrationsField;
  }

  static findPopoverButton() {
    return cy.get(ExternalPartnerIntegrationsField.alias).findByRole('img', {
      hidden: true,
    });
  }

  static findPopoverContent() {
    // The popover is attached to the bottom of the body by default.
    // No need to search anything related to it within this form field.
    return cy
      .get('#popover-externalPartnerIntegrations-body')
      .findByText(
        /to integrate with an external partner \(for example, oracle cloud\), you'll need to provide a custom manifest\./i,
      );
  }
  static findLabel() {
    return cy
      .get(ExternalPartnerIntegrationsField.alias)
      .findByText(/external partner integrations/i);
  }

  static findHelperText() {
    return cy
      .get(ExternalPartnerIntegrationsField.alias)
      .findByText(/integrate with other platforms using custom manifests\./i);
  }

  static findCheckbox() {
    return cy.get(ExternalPartnerIntegrationsField.alias).findByRole('checkbox', {
      name: /external partner integrations/i,
    });
  }
}
