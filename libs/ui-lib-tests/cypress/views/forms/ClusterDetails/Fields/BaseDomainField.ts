const selector = '#form-control__form-input-baseDnsDomain-field';
const checkboxSelector = '#form-checkbox-useRedHatDnsService-field';

export const BaseDomain = (parentSelector: string) => ({
  get: () => {
    return cy.get(parentSelector).find(selector);
  },

  dnsCheckbox: () => {
    return cy.get(parentSelector).find(checkboxSelector);
  },
});
