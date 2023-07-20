export class HostsNetworkConfigurationField {
  static readonly alias = `@${HostsNetworkConfigurationField.name}`;
  static readonly selector = '#form-control__form-radio-hostsNetworkConfigurationType-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(HostsNetworkConfigurationField.selector, ancestorAlias).as(
      HostsNetworkConfigurationField.name,
    );
    return HostsNetworkConfigurationField;
  }

  static findLabel() {
    return cy.get(HostsNetworkConfigurationField.alias).findByText(/hosts' network configuration/i);
  }

  static findStaticIpRadioButton() {
    return cy
      .get(HostsNetworkConfigurationField.alias)
      .find('#form-radio-hostsNetworkConfigurationType-static-field');
  }

  static findStaticIpRadioLabel() {
    return cy
      .get(HostsNetworkConfigurationField.alias)
      .findByText(/static ip, bridges, and bonds/i);
  }
}
