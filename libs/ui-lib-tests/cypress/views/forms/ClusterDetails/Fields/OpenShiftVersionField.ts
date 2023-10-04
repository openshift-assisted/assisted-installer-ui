const selector = '#form-input-openshiftVersion-field';

export const OpenshiftVersion = (parentSelector: string) => ({
  get: () => {
    return cy.get(parentSelector).find(selector);
  },

  open: () => {
    OpenshiftVersion(parentSelector).get().find('button').click();
  },

  select: (version = Cypress.env('OPENSHIFT_VERSION')) => {
    OpenshiftVersion(parentSelector).open();
    OpenshiftVersion(parentSelector)
      .get()
      .find('ul')
      .within(() => {
        cy.get('li').contains(version).click();
      });
  },
});
