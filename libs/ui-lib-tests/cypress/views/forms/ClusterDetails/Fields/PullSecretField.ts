import { pullSecret } from '../../../../fixtures';

const selector = '#form-input-pullSecret-field';
export const PullSecret = (parentSelector: string) => ({
  get: () => {
    return cy.get(parentSelector).find(selector);
  },

  input: () => {
    PullSecret(parentSelector).get().pasteText(pullSecret);
  },
});
