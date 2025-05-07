export class ControlPlaneNodesField {
  static readonly alias = `@${ControlPlaneNodesField.name}`;
  static readonly selector = '#form-control__form-input-controlPlaneCount-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ControlPlaneNodesField.selector, ancestorAlias).as(
      ControlPlaneNodesField.name,
    );

    return ControlPlaneNodesField;
  }

  static findLabel() {
    return cy.get(ControlPlaneNodesField.alias).findByText(/number of control plane nodes/i);
  }

  static findControlPlaneNodeField() {
    return cy.get('#form-input-controlPlaneCount-field');
  }

  static findDropdown() {
    return cy.get('#form-input-controlPlaneCount-field-dropdown');
  }

  static selectControlPlaneNode(controlPlaneCount: number) {
    ControlPlaneNodesField.findControlPlaneNodeField().click();
    ControlPlaneNodesField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`${controlPlaneCount}`, 'i') }).click();
    });
  }
}
