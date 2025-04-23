export class CpuArchitectureField {
  static readonly alias = `@${CpuArchitectureField.name}`;
  static readonly selector = '#form-control__form-input-cpuArchitecture-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(CpuArchitectureField.selector, ancestorAlias).as(CpuArchitectureField.name);

    return CpuArchitectureField;
  }

  static findLabel() {
    return cy.get(CpuArchitectureField.alias).findByText(/cpu architecture/i);
  }

  static findCpuArchitectureField() {
    return cy.get(CpuArchitectureField.alias).find('#form-input-cpuArchitecture-field');
  }

  static findDropdown() {
    return cy.get(CpuArchitectureField.alias).find('#form-input-cpuArchitecture-field-dropdown');
  }

  static selectCpuArchitecture(cpuArch: string) {
    CpuArchitectureField.findCpuArchitectureField().click();
    CpuArchitectureField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`${cpuArch}`, 'i') }).click();
    });
  }
}
