import './commands';
import './interceptors';
import './selectors';
import './variables/index';
import * as utils from './utils';

// eslint-disable-next-line consistent-return
function abortEarly() {
  if (this.currentTest.state === 'failed') {
    return cy.task('shouldSkip', true);
  }
  cy.task('shouldSkip').then((value) => {
    if (value) this.skip();
  });
}

beforeEach(abortEarly);
afterEach(abortEarly);

before(() => {
  if (Cypress.browser.isHeaded) {
    // Reset the shouldSkip flag at the start of a run, so that it
    //  doesn't carry over into subsequent runs.
    // Do this only for headed runs because in headless runs,
    //  the `before` hook is executed for each spec file.
    cy.task('resetShouldSkipFlag');
  }
});

export { utils };
