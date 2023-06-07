import { customManifestContent } from '../../fixtures/custom-manifests/manifests';

Cypress.env(
  'yamlContentAddContentButton',
  '.pf-c-file-upload .pf-c-empty-state__secondary > button',
);
Cypress.env('helperTextError', 'div.pf-c-form__helper-text.pf-m-error');
Cypress.env('customManifestFileName', '[data-testid=filename-0]');
Cypress.env('alertTitle', 'div.pf-c-alert.pf-m-danger > h4.pf-c-alert__title');
Cypress.env('addCustomManifests', '[data-testid=add-manifest]');
Cypress.env('manifest1Id', '[data-testid=filename-1]');
Cypress.env('lastInputTypeFile', 'input[type="file"]:last');
Cypress.env('removeManifestButton', '[aria-label="remove manifest"]:last');
Cypress.env('removeConfirmationButton', '[data-testid=confirm-modal-submit]');
