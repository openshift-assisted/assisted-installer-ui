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
    return ClusterDetailsForm.body.find(
      '#form-control__form-checkbox-externalPartnerIntegrations-field',
    );
  }

  static findPopoverButton() {
    return ExternalPartnerIntegrationsControl.body.findByRole('img', {
      hidden: true,
    });
  }

  static findPopoverContent() {
    return ExternalPartnerIntegrationsControl.body
      .scrollIntoView()
      .get('#popover-externalPartnerIntegrations-body');
  }

  static findLabel() {
    return ExternalPartnerIntegrationsControl.body.findByText(/external partner integrations/i);
  }

  static findHelperText() {
    return ExternalPartnerIntegrationsControl.body.findByText(
      /integrate with other platforms using custom manifests\./i,
    );
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
