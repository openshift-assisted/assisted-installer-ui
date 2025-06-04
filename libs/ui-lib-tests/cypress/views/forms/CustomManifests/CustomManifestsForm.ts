import { CollapsedManifest, ExpandedManifest } from './Fields';

export const CustomManifestsForm = {
  body: () => {
    return cy.get('.pf-v6-c-wizard__main-body');
  },

  expandedManifest: (index) => {
    return ExpandedManifest(`@ExpandedManifest-${index}`, index);
  },
  collapsedManifest: (index) => {
    return CollapsedManifest(`@CollapsedManifest-${index}`, index);
  },

  validationAlert: () => {
    return cy.get('.pf-v6-c-alert.pf-m-danger');
  },
  addManifest: () => {
    return CustomManifestsForm.body().findByTestId('add-manifest');
  },

  removeManifest: (index: number) => {
    return CustomManifestsForm.body().findByTestId(`remove-manifest-${index}`);
  },

  getRemoveConfirmationButton: () => {
    return cy.findByTestId('confirm-modal-submit');
  },

  initManifest: (index: number, collapsed: boolean = false) => {
    if (collapsed) {
      return CustomManifestsForm.body()
        .findByTestId(`collapsed-manifest-${index}`)
        .as(`CollapsedManifest-${index}`);
    } else {
      return CustomManifestsForm.body()
        .findByTestId(`expanded-manifest-${index}`)
        .as(`ExpandedManifest-${index}`);
    }
  },

  collapseManifest: (index: number) => {
    CustomManifestsForm.body().findByTestId(`toggle-manifest-${index}`).click();
  },
};
