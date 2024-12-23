import { NewClusterPage } from '../../../views/pages/NewClusterPage';
import { ClusterDetailsForm } from '../../../views/forms/ClusterDetails/ClusterDetailsForm';
import { clusterDetailsPage } from '../../../views/clusterDetails';

describe('Create a new cluster and show correct validations for every field', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };
  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    NewClusterPage.visit();
    ClusterDetailsForm.init();
  });

  it('Base Name (Invalid)', () => {
    const invalidDnsDomain = 'iamnotavaliddnsdomain-iamnotavaliddnsdomain-iamnotavaliddnsdomain';
    clusterDetailsPage.inputClusterName();
    clusterDetailsPage.inputBaseDnsDomain(invalidDnsDomain);
    clusterDetailsPage.clickClusterDetailsBody();
    clusterDetailsPage.validateInputDnsDomainFieldHelper(
      `Every single host component in the base domain name cannot contain more than 63 characters and must not contain spaces.`,
    );
  });

  it('Base Name (Field Not Empty)', () => {
    const emptyDns = ' ';
    clusterDetailsPage.inputBaseDnsDomain(emptyDns);
    clusterDetailsPage.clickClusterDetailsBody();
    clusterDetailsPage.validateInputDnsDomainFieldHelper(
      `Every single host component in the base domain name cannot contain more than 63 characters and must not contain spaces.`,
    );
  });

  it('Pull secret (Field not empty)', () => {
    const emptyPullSecret = '{}';
    let pullSecretError = 'Required.';
    clusterDetailsPage.inputPullSecret(emptyPullSecret);
    clusterDetailsPage.clearPullSecret();
    clusterDetailsPage.validateInputPullSecretFieldHelper(pullSecretError);
  });

  it('Pull Secret (Malformed)', () => {
    const malformedJsonPullSecret = '{{}}';
    let pullSecretError =
      "Invalid pull secret format. You must use your Red Hat account's pull secret";
    clusterDetailsPage.clearPullSecret();
    clusterDetailsPage.inputPullSecret(malformedJsonPullSecret);
    clusterDetailsPage.clickClusterDetailsBody();
    clusterDetailsPage.validateInputPullSecretFieldHelper(pullSecretError);
  });

  it('Pull secret (Invalid entry)', () => {
    const invalidPullSecret = '{"invalid": "pull-secret"}';
    // Need to set valid name and DNS
    clusterDetailsPage.inputClusterName();
    clusterDetailsPage.inputBaseDnsDomain();
    clusterDetailsPage.clearPullSecret();
    clusterDetailsPage.inputPullSecret(invalidPullSecret);

    const errorSuffix = Cypress.env('OCM_USER')
      ? 'Learn more about pull secrets and view examples'
      : "A Red Hat account's pull secret can be found in";
    clusterDetailsPage.clickClusterDetailsBody();
    clusterDetailsPage.validateInputPullSecretFieldHelper(
      `Invalid pull secret format. You must use your Red Hat account's pull secret`,
    );
  });
});
