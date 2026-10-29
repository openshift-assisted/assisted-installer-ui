/*
VARIABLES
 */
Cypress.expose('clusterNameFieldValidator', `[aria-label='Validation']`);
Cypress.expose('clusterNameFieldId', '#form-input-name-field');
Cypress.expose('openshiftVersionFieldId', '#form-input-openshiftVersion-field');
Cypress.expose('imageTypeFieldId', '#form-input-imageType-field');
Cypress.expose('pullSecretFieldId', '#form-input-pullSecret-field');
Cypress.expose('assistedInstallerSupportLevel', `[data-testid=assisted-installer-support-level]`);
Cypress.expose('snoSupportLevel', `[data-testid=SNO-support-level]`);
Cypress.expose('baseDnsDomainFieldId', '#form-input-baseDnsDomain-field');
Cypress.expose('highAvailabilityModeFieldId', '#form-input-highAvailabilityMode-field');
Cypress.expose('cpuArchitectureFieldId', '#form-input-cpuArchitecture-field');
Cypress.expose('useRedHatDnsServiceFieldId', '#form-checkbox-useRedHatDnsService-field');
Cypress.expose('enableStaticIpRadioButtonText', 'Static network configuration');
Cypress.expose('cpuArchitectureFieldHelperId', '#form-input-cpuArchitecture-field-helper');
Cypress.expose('pullSecretFieldHelperId', '#form-input-pullSecret-field-helper');
Cypress.expose('clusterNameFieldHelperId', '#form-input-name-field-helper');
Cypress.expose('baseDnsDomainFieldHelperId', '#form-input-baseDnsDomain-field-helper');
Cypress.expose(
  'staticIpNetworkConfigFieldId',
  '#form-radio-hostsNetworkConfigurationType-static-field',
);
Cypress.expose('baseDnsDomainFieldHelperErrorId', '#form-input-baseDnsDomain-field-helper-error');
Cypress.expose('pullSecretFieldHelperErrorId', '#form-input-pullSecret-field-helper-error');
Cypress.expose('controlPlaneNodesFieldId', '#form-input-controlPlaneCount-field');
