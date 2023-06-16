export default class OperatorsForm {
  static get body() {
    return cy.get('.pf-c-wizard__main-body');
  }

  static get mceOperatorControl() {
    return MceOperatorControl;
  }
}

/** @private */
class MceOperatorControl {
  static get body() {
    return OperatorsForm.body.find('#form-control__form-checkbox-useMultiClusterEngine-field');
  }

  static findPopoverButton() {
    return MceOperatorControl.body.find('.pf-c-button').findByRole('img', {
      hidden: true,
    });
  }

  static findPopoverContent() {
    return MceOperatorControl.body.scrollIntoView().get('#popover-useMultiClusterEngine-body');
  }

  static findLabel() {
    return MceOperatorControl.body.findByText(/install multicluster engine/i);
  }

  static findHelperText() {
    return MceOperatorControl.body.findByText(
      /Transform your cluster into a cluster lifecycle manager for all your OpenShift clusters\./i,
    );
  }
}
