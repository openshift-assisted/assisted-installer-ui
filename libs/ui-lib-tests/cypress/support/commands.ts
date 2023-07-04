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

Cypress.Commands.add('pasteText', (selector, text) => {
  cy.get(selector).then((elem) => {
    elem.text(text);
    elem.val(text);
    cy.get(selector).type(' {backspace}');
  });
});
