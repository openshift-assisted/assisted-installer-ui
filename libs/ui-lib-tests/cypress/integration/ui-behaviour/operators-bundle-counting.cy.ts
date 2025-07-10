import { commonActions } from '../../views/common';
import { operatorsPage } from '../../views/operatorsPage';

describe('Operators bundle counting behavior', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
    commonActions.visitClusterDetailsPage();
    commonActions.startAtWizardStep('Operators');
  });

  describe('Single operators count', () => {
    it('Should show correct count when bundle operators are selected', () => {
      // First, check initial state - expand Single Operators to see initial count
      operatorsPage.singleOperatorsToggle().click();
      operatorsPage.singleOperatorsToggle().should('contain.text', '0 selected');

      // Collapse Single Operators section
      operatorsPage.singleOperatorsToggle().click();

      // Select the Virtualization bundle (this should auto-select cnv, nmstate, mtv)
      cy.get('[data-testid="bundle-virtualization"]').should('be.visible');
      cy.get('[data-testid="bundle-virtualization"]').find('input[type="checkbox"]').click();

      // Expand Single Operators section again to check the count
      operatorsPage.singleOperatorsToggle().click();

      // Should show 3 selected (cnv, nmstate, mtv from the Virtualization bundle)
      operatorsPage.singleOperatorsToggle().should('contain.text', '3 selected');

      // Verify that the bundle operators are checked and disabled
      cy.get('#form-input-cnv-field').should('be.checked').should('be.disabled');
      cy.get('#form-input-nmstate-field').should('be.checked').should('be.disabled');
      cy.get('#form-input-mtv-field').should('be.checked').should('be.disabled');
    });

    it('Should show correct count when both manual and bundle operators are selected', () => {
      // First select a manual operator
      operatorsPage.singleOperatorsToggle().click();
      cy.get('#form-input-lvm-field').click();
      operatorsPage.singleOperatorsToggle().should('contain.text', '1 selected');

      // Collapse and select the Virtualization bundle
      operatorsPage.singleOperatorsToggle().click();
      cy.get('[data-testid="bundle-virtualization"]').find('input[type="checkbox"]').click();

      // Expand Single Operators section again
      operatorsPage.singleOperatorsToggle().click();

      // Should show 4 selected (1 manual + 3 from bundle)
      operatorsPage.singleOperatorsToggle().should('contain.text', '4 selected');
    });
  });
});
