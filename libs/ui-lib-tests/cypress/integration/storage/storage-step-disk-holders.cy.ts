import { commonActions } from '../../views/common';
import { ValidateDiskHoldersParams, hostsTableSection } from '../../views/hostsTableSection';
import { StoragePage } from '../../views/pages/StoragePage';

describe(`Assisted Installer Storage Step`, () => {
  let storagePage;
  const disks = [
    { name: 'vda' },
    { name: 'vdb' },
    { name: 'dm-1' },
    { name: 'sda', indented: true },
    { name: 'sdb', indented: true },
    { name: 'md0' },
    { name: 'vdc', indented: true },
    { name: 'vdd', indented: true },
    { name: 'sr0' },
  ] as ValidateDiskHoldersParams;

  const warningTexts = [
    'LVM logical volumes were found on the installation disk vdb selected for host storage-test-odf-master-1 and will be deleted during installation.',
    'The installation disk vdc selected for host storage-test-odf-master-2, is part of a software RAID that will be deleted during the installation.',
    'The installation disk sdb selected for host storage-test-odf-master-3 is managed by multipath. We strongly recommend using the multipath device dm-1 to improve reliability.',
  ];

  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_DISK_HOLDERS_CLUSTER',
    });
  };

  before(() => {
    setTestStartSignal('READY_TO_INSTALL');
  });

  describe(`Host storage`, () => {
    beforeEach(() => {
      setTestStartSignal('READY_TO_INSTALL');
      commonActions.visitClusterDetailsPage();
      commonActions.startAtWizardStep('Storage');

      storagePage = new StoragePage();
    });

    it('Should display the correct alerts', () => {
      storagePage.diskLimitationAlert.title.should(
        'contain.text',
        'Warning alert:Installation disk limitations',
      );

      storagePage.diskLimitationAlert.description.find('li').then(($res) => {
        expect($res).to.have.length(3);
        warningTexts.forEach((text, index) => expect($res[index]).to.contain(text));
      });

      storagePage.diskFormattingAlert.title.should(
        'contain.text',
        'Warning alert:All bootable disks, except for read-only disks, will be formatted during installation. Make sure to back up any critical data before proceeding.',
      );
    });

    it('Should display the correct warning for LVM', () => {
      disks[1].warning = true;

      hostsTableSection.getHostDisksExpander(0).click();
      hostsTableSection.validateGroupingByDiskHolders(disks, warningTexts[0]);
    });

    it('Should display the correct warning for RAID', () => {
      disks[1].warning = false;
      disks[6].warning = true;

      hostsTableSection.getHostDisksExpander(1).click();
      hostsTableSection.validateGroupingByDiskHolders(disks, warningTexts[1]);
    });

    it('Should display the correct warning for multipath', () => {
      disks[6].warning = false;
      disks[4].warning = true;

      hostsTableSection.getHostDisksExpander(2).click();
      hostsTableSection.validateGroupingByDiskHolders(disks, warningTexts[2]);
    });

    it('Should display no warnings', () => {
      disks[6].warning = false;

      hostsTableSection.getHostDisksExpander(2).click();
      hostsTableSection.validateGroupingByDiskHolders(disks);
    });
  });
});
