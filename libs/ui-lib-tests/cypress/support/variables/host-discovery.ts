// Generate ISO Modal
Cypress.expose('generateDiscoveryIsoModalId', '#generate-discovery-iso-modal');
Cypress.expose('sshPublicKeyText', 'SSH public key');
Cypress.expose('sshPublicKeyFilenameId', '#sshPublicKey-filename');
Cypress.expose('dragAndDropFileText', 'Drag a file here or browse to upload');
Cypress.expose('sshPublicKeyBrowseButtonId', '#sshPublicKey-browse-button');
Cypress.expose('sshPublicKeyFieldId', '#sshPublicKey');
Cypress.expose('formRadioImageTypeMinIsoFieldId', '#form-radio-imageType-minimal-iso-field');
Cypress.expose('sshPulicKeyFieldHelperId', '#form-input-sshPublicKey-discovery-field-helper');
Cypress.expose('enableProxyFieldId', '#form-checkbox-enableProxy-field');
Cypress.expose('httpProxyFieldHelperId', '#form-input-httpProxy-field-helper');
Cypress.expose('httpsProxyFieldHelperId', '#form-input-httpsProxy-field-helper');
Cypress.expose('noProxyFieldHelperId', '#form-input-noProxy-field-helper');
Cypress.expose('hostnameFieldHelperId', '#form-input-hostname-field-helper');
Cypress.expose('generateIsoModalFooterText', 'Generate Discovery ISO');
Cypress.expose('httpProxyFieldId', '#form-input-httpProxy-field');
Cypress.expose('httpsProxyFieldId', '#form-input-httpsProxy-field');
Cypress.expose('noProxyFieldId', '#form-input-noProxy-field');
Cypress.expose('isoReadyToDownloadText', 'Discovery ISO is ready to be downloaded');
Cypress.expose('editIso', `[data-testid=edit-iso-btn]`);
Cypress.expose('closeIso', `[data-testid=close-iso-btn]`);
Cypress.expose('hostRole', `[data-testid=host-role]`);
Cypress.expose('hostnameFieldId', '#form-input-hostname-field');
Cypress.expose('deleteHostSubmit', `[data-testid=delete-host-submit]`);
Cypress.expose('hostInventoryDownloadDiscoveryIso', '#host-inventory-button-download-discovery-iso');
Cypress.expose('hostInventoryDownloadDiscoveryIsoButtonText', 'Add host');
Cypress.expose(
  'neverShareWarningText',
  'Never share your downloaded ISO with anyone else. Forwarding it could put your credentials and personal data at risk.',
);

// Baremetal Discovery
Cypress.expose('hostRowKebabMenuChangeHostnameText', 'Change hostname');
Cypress.expose('colHeaderCpuCoresId', '#col-header-cpucores');
Cypress.expose(
  'bareMetalInventoryAddHostsButtonDownloadDiscoveryIso',
  '#bare-metal-inventory-add-host-button-download-discovery-iso',
);
Cypress.expose(
  'useContainerNativeVirtualizationField',
  '#form-input-cnv-field',
);
Cypress.expose('useOpenShiftDataFoundation', '#form-input-odf-field');
Cypress.expose('useOdfLogicalVolumeManagerField', '#form-checkbox-useOdfLogicalVolumeManager-field');
Cypress.expose('integrateWithVsphere', 'Integrate with vSphere');
