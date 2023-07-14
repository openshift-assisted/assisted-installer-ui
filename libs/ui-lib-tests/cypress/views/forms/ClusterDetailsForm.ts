export default class ClusterDetailsForm {
  static get body() {
    return cy.get('#wizard-cluster-details__form');
  }

  static get externalPartnerIntegrationsControl() {
    return ExternalPartnerIntegrationsControl;
  }

  static get customManifestsControl() {
    return CustomManifestsControl;
  }

  static get clusterNameControl() {
    return ClusterNameControl;
  }

  static get baseDomainControl() {
    return BaseDomainControl;
  }
}

/** @private */
class ClusterNameControl {
  static get body() {
    return ClusterDetailsForm.body.find('#form-control__form-input-name-field');
  }

  static findInputField() {
    return ClusterNameControl.body.findByRole('textbox', {
      name: /cluster name/i,
    });
  }
}

/** @private */
class BaseDomainControl {
  static get body() {
    return ClusterDetailsForm.body.find('#form-control__form-input-baseDnsDomain-field');
  }

  static findInputField() {
    return BaseDomainControl.body.findByRole('textbox', {
      name: /base domain/i,
    });
  }
}

/** @private */
class ExternalPartnerIntegrationsControl {
  static get body() {
    return ClusterDetailsForm.body.find('#form-control__form-input-platform-field');
  }

  static get dropdownField() {
    return ClusterDetailsForm.body.find('#form-input-platform-field');
  }

  static get platformIntegrationDropdownButton() {
    return ExternalPartnerIntegrationsControl.dropdownField.find('button.pf-c-dropdown__toggle');
  }

  static get platformIntegrationDropdown() {
    return ExternalPartnerIntegrationsControl.dropdownField.find('.pf-c-dropdown__menu');
  }

  static get platformIntegrationDropdownItems() {
    return ExternalPartnerIntegrationsControl.platformIntegrationDropdown.find('[role="menuitem"]');
  }

  static getPlatformIntegrationDropdownItemByLabel(label: string) {
    return ExternalPartnerIntegrationsControl.platformIntegrationDropdownItems.contains(label);
  }

  static get tooltip() {
    return cy.get('body').find('.pf-c-tooltip');
  }
}

/** @private */
class CustomManifestsControl {
  static get body() {
    return ClusterDetailsForm.body
      .find('#form-control__form-input-addCustomManifest-field')
      .parent();
  }

  static findCheckbox() {
    return CustomManifestsControl.body.findByRole('checkbox', {
      name: /include custom manifests/i,
    });
  }

  static findLabel() {
    return ExternalPartnerIntegrationsControl.body
      .scrollIntoView()
      .findByText(/include custom manifests/i);
  }
}
