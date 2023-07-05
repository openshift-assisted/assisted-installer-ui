import { storagePage } from '../../views/storagePage';
import { commonActions } from '../../views/common';
import { hostsTableSection } from '../../views/hostsTableSection';

const masterDisks = [
  {
    id: '/dev/sda-10',
    size: '17.80 GB',
    type: 'HDD',
  },
  {
    id: '/dev/sr-11',
    size: '1.05 GB',
    type: 'ODD',
  },
];

const workerDisks = [
  {
    id: '/dev/sda-40',
    size: '10.48 GB',
    type: 'HDD',
  },
  {
    id: '/dev/sr-41',
    size: '1.05 GB',
    type: 'ODD',
  },
];

describe(`Assisted Installer Storage Step`, () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_STORAGE_CLUSTER',
    });
  };

  before(refreshTestSetup);

  describe(`Host storage table`, () => {
    beforeEach(() => {
      refreshTestSetup();
      commonActions.visitClusterDetailsPage();
      commonActions.startAtWizardStep('Storage');
    });

    it('Should display the existing hosts storage details', () => {
      Cypress.env('masterDiskTotalSize', '35.59 GB');
      Cypress.env('workerDiskTotalSize', '20.95 GB');
      hostsTableSection.waitForHardwareStatus('Ready');
      hostsTableSection.validateHostRoles();
      hostsTableSection.validateHostDiskSize();
      storagePage.validateNumberOfDisks();
    });

    it('Should display the ODF usage column', () => {
      storagePage.validateODFUsage();
    });

    it('Should show the disks details', () => {
      const hosts = [
        {
          hostId: 0,
          disks: masterDisks,
        },
        {
          hostId: 3,
          disks: workerDisks,
        },
      ];

      hosts.forEach((host) => {
        hostsTableSection.getHostDisksExpander(host.hostId).click();
        hostsTableSection.getHostDetailsTitle(host.hostId).should('have.text', '3 Disks');
        hostsTableSection.validateHostDisksDetails(host.disks);
        hostsTableSection.getHostDisksExpander(host.hostId).click();
      });
    });

    it('Should display the skip formatting disk column, warning alert and warning icon', () => {
      const hosts = [
        {
          hostId: 3,
          realHostId: 'cf2f3477-896f-40be-876a-b2ac3f2a838c',
          disks: workerDisks,
        },
      ];

      hosts.forEach((host) => {
        hostsTableSection.getHostDisksExpander(host.hostId).click();
        storagePage.validateSkipFormattingDisks(host.realHostId, 3);
        storagePage.validateSkipFormattingWarning();
        storagePage.validateSkipFormattingIcon(workerDisks[0].id);
        hostsTableSection.getHostDisksExpander(host.hostId).click();
      });
    });
  });
});
