import React from 'react';
import {
  SplitItem,
  Split,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  RadioField,
  SwitchField,
  PopoverIcon,
  DiskEncryption,
  ENCRYPTING_DISK_DURING_INSTALLATION,
} from '../../../common';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

export interface DiskEncryptionControlGroupProps {
  enableDiskEncryptionOnWorkers: boolean;
  enableDiskEncryptionOnMasters: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  isSchedulableMastersEnabled: boolean;
}

const DiskEncryptionOnWorkers: React.FC<{ isTooltipHidden: boolean }> = ({
  isTooltipHidden = false,
}) => (
  <>
    <Tooltip
      hidden={isTooltipHidden}
      content={'This toggle will be "Off" and not editable when less than 5 hosts were discovered'}
    >
      <span>Enable encryption of installation disks on workers</span>
    </Tooltip>{' '}
  </>
);
const DiskEncryptionModeOptions: React.FC = () => {
  return (
    <Flex>
      <FlexItem spacer={{ default: 'spacer3xl' }}>
        <Split>
          <SplitItem>
            <RadioField name="diskEncryptionMode" label="TPM v2" id="TPMV2-button" value="tpmv2" />
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              component={'a'}
              variant={'plain'}
              IconComponent={HelpIcon}
              minWidth="10rem"
              bodyContent={
                <p>
                  TPM v2 stores passphrases in a secure cryptoprocessor contained within as server.
                  &nbsp;
                  <a
                    href={ENCRYPTING_DISK_DURING_INSTALLATION}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {'Learn more'} <ExternalLinkAltIcon />
                  </a>
                </p>
              }
            />
          </SplitItem>
        </Split>
      </FlexItem>
      <FlexItem spacer={{ default: 'spacer3xl' }}>
        <Split>
          <SplitItem>
            <RadioField name="diskEncryptionMode" label="TANG" id="TANG-button" value="tang" />
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              component={'a'}
              variant={'plain'}
              IconComponent={HelpIcon}
              minWidth="10rem"
              bodyContent={
                <p>
                  Tang server component that enable network-bound disk encryption (NBDE). &nbsp;
                  <a
                    href={ENCRYPTING_DISK_DURING_INSTALLATION}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {'Learn more'} <ExternalLinkAltIcon />
                  </a>
                </p>
              }
            />
          </SplitItem>
        </Split>
      </FlexItem>
    </Flex>
  );
};

const DiskEncryptionControlGroup: React.FC<DiskEncryptionControlGroupProps> = ({
  enableDiskEncryptionOnMasters,
  enableDiskEncryptionOnWorkers,
  isSchedulableMastersEnabled,
}) => {
  const enableOnBoth = enableDiskEncryptionOnWorkers && enableDiskEncryptionOnMasters;

  return (
    <Stack hasGutter>
      <StackItem>
        <SwitchField
          name="enableDiskEncryptionOnMasters"
          label="Enable encryption of installation disks on control plane nodes"
        />
      </StackItem>
      {(enableDiskEncryptionOnMasters || enableOnBoth) && (
        <StackItem>
          <DiskEncryptionModeOptions />
        </StackItem>
      )}
      <StackItem>
        <SwitchField
          name="enableDiskEncryptionOnWorkers"
          isDisabled={!isSchedulableMastersEnabled}
          label={<DiskEncryptionOnWorkers isTooltipHidden={isSchedulableMastersEnabled} />}
        />
      </StackItem>
      {enableDiskEncryptionOnWorkers && !enableOnBoth && (
        <StackItem>
          <DiskEncryptionModeOptions />
        </StackItem>
      )}
    </Stack>
  );
};

export default DiskEncryptionControlGroup;
