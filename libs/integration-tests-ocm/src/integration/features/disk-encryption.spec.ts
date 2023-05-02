import { clusterDetailsPage } from '../../views/clusterDetails';
import { diskEncryptionSection } from '../../views/diskEncryptionSection';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { commonActions } from '../../views/common';
import { diskEncryptionValues, tangServerValues } from '../../fixtures/disk-encryption';
import * as utils from '../../support/utils';
import { transformBasedOnUIVersion } from '../../support/transformations';

const fillTangServers = (index) => {
  const tangServerUrl = diskEncryptionSection.getTangServerUrl(index);
  tangServerUrl.type(tangServerValues.Url);
  tangServerUrl.should('have.value', tangServerValues.Url);
  const tangServerThumbprint = diskEncryptionSection.getTangServerThumbprint(index);
  tangServerThumbprint.type(tangServerValues.Thumbprint);
  tangServerThumbprint.should('have.value', tangServerValues.Thumbprint);
};

describe(`Assisted Installer Disk Encryption`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
    transformBasedOnUIVersion();

    commonActions.visitNewClusterPage();
    clusterDetailsPage.inputClusterName();
    clusterDetailsPage.getRedHatDnsServiceCheck().check();
    clusterDetailsPage.inputOpenshiftVersion();
    clusterDetailsPage.inputPullSecret();
  });

  describe(`Unit tests`, () => {
    beforeEach(() => {
      cy.loadAiAPIIntercepts(null);
      diskEncryptionSection.getMastersEncryptionSwitch().click({ force: true });
    });

    afterEach(() => {
      commonActions.waitForSave();
      commonActions.waitForNext();
      diskEncryptionSection.getMastersEncryptionSwitch().click({ force: true });
    });

    it('Can use disk encryption', () => {
      //enable disk encryption
      diskEncryptionSection.getWorkersEncryptionSwitch().click({ force: true });
      diskEncryptionSection.getEncryptionMode().first().should('be.checked');
      diskEncryptionSection.getEncryptionMode().first().should('have.value', 'tpmv2');
      diskEncryptionSection.getWorkersEncryptionSwitch().click({ force: true });
      //enableTangServers
      diskEncryptionSection.getEncryptionMode().check('tang');
      diskEncryptionSection.getTangServerUrl(0).scrollIntoView().should('be.visible');
      diskEncryptionSection.getTangServerThumbprint(0).should('be.visible');
      diskEncryptionSection.getEncryptionMode().first().check();
    });

    it('Add tang servers', () => {
      diskEncryptionSection.getEncryptionMode().check('tang');
      diskEncryptionSection.getAnotherTangServerButton().click();
      fillTangServers(0);
      diskEncryptionSection.getTangServerUrl(1).should('be.visible');
      diskEncryptionSection.getTangServerThumbprint(1).should('be.visible');
      fillTangServers(1);
    });
  });

  describe(`Disk Encryption Submission`, () => {
    it('Can submit the form with Tang encryption', () => {
      cy.loadAiAPIIntercepts(null);
      diskEncryptionSection.getMastersEncryptionSwitch().click({ force: true });
      diskEncryptionSection.getEncryptionMode().check('tang');
      fillTangServers(0);

      commonActions.clickNextButton();

      cy.wait('@create-cluster').then(({ request }) => {
        expect(request.body.disk_encryption.valueOf()).to.deep.equal(diskEncryptionValues);
      });
      cy.wait('@create-infra-env');
      utils.setLastWizardSignal('CLUSTER_CREATED');

      commonActions.clickNextButton();
      cy.get('h2').should('contain', 'Host discovery');
      bareMetalDiscoveryPage.setClusterIdFromUrl();
    });
  });
});
