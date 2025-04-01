export default class OperatorsForm {
  static get body() {
    return cy.get('.pf-v5-c-wizard__main-body');
  }

  static get mceOperatorControl() {
    return MceOperatorControl;
  }

  static get mtvOperatorControl() {
    return MtvOperatorControl;
  }
}

/** @private */
class MceOperatorControl {
  static get body() {
    return OperatorsForm.body.find('#form-control__form-checkbox-useMultiClusterEngine-field');
  }

  static findPopoverButton() {
    return MceOperatorControl.body.find('.pf-v5-c-button').findByRole('img', {
      hidden: true,
    });
  }

  static findPopoverContent() {
    return MceOperatorControl.body.scrollIntoView().get('#popover-useMultiClusterEngine-body');
  }

  static findLabel() {
    return MceOperatorControl.body.findByText(/Multicluster engine/i);
  }

  static findHelperText() {
    return MceOperatorControl.body.findByText(
      /Create, import, and manage multiple clusters from this cluster\./i,
    );
  }
}

/** @private */
class MtvOperatorControl {
  static get body() {
    return OperatorsForm.body.find(
      '#form-control__form-checkbox-useMigrationToolkitforVirtualization-field',
    );
  }

  static findPopoverButton() {
    return MtvOperatorControl.body.find('.pf-v5-c-button').findByRole('img', {
      hidden: true,
    });
  }

  static findPopoverContent() {
    return MtvOperatorControl.body
      .scrollIntoView()
      .get('#popover-useMigrationToolkitforVirtualization-body');
  }

  static findLabel() {
    return MtvOperatorControl.body.findByText(/Migration toolkit for virtualization/i);
  }

  static findHelperText() {
    return MtvOperatorControl.body.findByText(
      /This Toolkit \(MTV\) enables you to migrate virtual machines from VMware vSphere, Red Hat Virtualization, or OpenStack to OpenShift Virtualization running on Red Hat OpenShift\./i,
    );
  }
}
