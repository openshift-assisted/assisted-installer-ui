import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import SwitchField from '../ui/formik/SwitchField';
import { DiskEncryptionMode, DiskEncryptionControlGroupProps } from './DiskEncryptionMode';

const DiskEncryptionControlGroup: React.FC<DiskEncryptionControlGroupProps> = ({
  enableDiskEncryptionOnMasters,
  enableDiskEncryptionOnWorkers,
  diskEncryptionMode,
  isDisabled,
}) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <SwitchField
          name="enableDiskEncryptionOnMasters"
          label="Enable encryption of installation disks on control plane nodes"
          isDisabled={isDisabled}
        />
      </StackItem>
      {enableDiskEncryptionOnMasters && !enableDiskEncryptionOnWorkers && (
        <StackItem>
          <DiskEncryptionMode
            diskEncryptionMode={diskEncryptionMode}
            enableDiskEncryptionOnMasters={enableDiskEncryptionOnMasters}
            enableDiskEncryptionOnWorkers={enableDiskEncryptionOnWorkers}
            isDisabled={isDisabled}
          />
        </StackItem>
      )}
      <StackItem>
        <SwitchField
          name="enableDiskEncryptionOnWorkers"
          isDisabled={isDisabled}
          label="Enable encryption of installation disks workers"
        />
      </StackItem>
      {enableDiskEncryptionOnWorkers && (
        <StackItem>
          <DiskEncryptionMode
            diskEncryptionMode={diskEncryptionMode}
            enableDiskEncryptionOnMasters={enableDiskEncryptionOnMasters}
            enableDiskEncryptionOnWorkers={enableDiskEncryptionOnWorkers}
            isDisabled={isDisabled}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default DiskEncryptionControlGroup;
