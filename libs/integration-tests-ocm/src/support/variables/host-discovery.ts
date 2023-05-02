// Generate ISO Modal
Cypress.env('generateDiscoveryIsoModalId', '#generate-discovery-iso-modal');
Cypress.env('sshPublicKeyText', 'SSH public key');
Cypress.env('sshPublicKeyFilenameId', '#sshPublicKey-filename');
Cypress.env('dragAndDropFileText', 'Drag a file here or browse to upload');
Cypress.env('sshPublicKeyBrowseButtonId', '#sshPublicKey-browse-button');
Cypress.env('sshPublicKeyFieldId', '#sshPublicKey');
Cypress.env('formRadioImageTypeMinIsoFieldId', '#form-radio-imageType-minimal-iso-field');
Cypress.env('sshPulicKeyFieldHelperId', '#form-input-sshPublicKey-discovery-field-helper');
Cypress.env('enableProxyFieldId', '#form-checkbox-enableProxy-field');
Cypress.env('httpProxyFieldHelperId', '#form-input-httpProxy-field-helper');
Cypress.env('httpsProxyFieldHelperId', '#form-input-httpsProxy-field-helper');
Cypress.env('noProxyFieldHelperId', '#form-input-noProxy-field-helper');
Cypress.env('hostnameFieldHelperId', '#form-input-hostname-field-helper');
Cypress.env('generateIsoModalFooterText', 'Generate Discovery ISO');
Cypress.env('httpProxyFieldId', '#form-input-httpProxy-field');
Cypress.env('httpsProxyFieldId', '#form-input-httpsProxy-field');
Cypress.env('noProxyFieldId', '#form-input-noProxy-field');
Cypress.env('isoReadyToDownloadText', 'Discovery ISO is ready to be downloaded');
Cypress.env('editIso', `[data-testid=edit-iso-btn]`);
Cypress.env('closeIso', `[data-testid=close-iso-btn]`);
Cypress.env('hostRole', `[data-testid=host-role]`);
Cypress.env('hostnameFieldId', '#form-input-hostname-field');
Cypress.env('deleteHostSubmit', `[data-testid=delete-host-submit]`);
Cypress.env('hostInventoryDownloadDiscoveryIso', '#host-inventory-button-download-discovery-iso');
Cypress.env('hostInventoryDownloadDiscoveryIsoButtonText', 'Add host');
Cypress.env(
  'neverShareWarningText',
  'Never share your downloaded ISO with anyone else. Forwarding it could put your credentials and personal data at risk.',
);

// Baremetal Discovery
Cypress.env('hostRowKebabMenuChangeHostnameText', 'Change hostname');
Cypress.env('colHeaderCpuCoresId', '#col-header-cpucores');
Cypress.env(
  'bareMetalInventoryAddHostsButtonDownloadDiscoveryIso',
  '#bare-metal-inventory-add-host-button-download-discovery-iso',
);
Cypress.env('useContainerNativeVirtualizationField', '#form-checkbox-useContainerNativeVirtualization-field');
Cypress.env('useOpenShiftDataFoundation', '#form-checkbox-useOpenShiftDataFoundation-field');
Cypress.env('useOdfLogicalVolumeManagerField', '#form-checkbox-useOdfLogicalVolumeManager-field');
Cypress.env('integrateWithVsphere', 'Integrate with vSphere');
