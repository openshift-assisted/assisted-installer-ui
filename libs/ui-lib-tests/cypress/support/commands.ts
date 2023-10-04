// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-fill-command';
import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';


Cypress.Commands.add('pasteText', { prevSubject: true }, (selector, text) => {
  cy.wrap(selector)
    .clear()
    .then((elem) => {
      elem.val(text);
      elem.text(text);
    })
    .type(' {backspace}');
});

Cypress.Commands.add('findWithinOrGet', (childSelector: string, ancestorAlias?: string) => {
  return ancestorAlias ? cy.get(ancestorAlias).find(childSelector) : cy.get(childSelector);
});
