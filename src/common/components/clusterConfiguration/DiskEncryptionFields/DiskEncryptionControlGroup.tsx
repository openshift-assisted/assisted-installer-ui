import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import SwitchField from '../../ui/formik/SwitchField';
import { DiskEncryptionMode } from './DiskEncryptionMode';
import { RenderIf } from '../../ui';
import { DiskEncryptionValues } from './DiskEncryptionValues';

export interface DiskEncryptionControlGroupProps {
  values: DiskEncryptionValues;
  isSNO: boolean;
  isDisabled?: boolean;
}

const DiskEncryptionControlGroup: React.FC<DiskEncryptionControlGroupProps> = ({
  values,
  isSNO = false,
  isDisabled,
}) => {
  const {
    enableDiskEncryptionOnMasters,
    enableDiskEncryptionOnWorkers,
    diskEncryptionMode,
  } = values;

  return (
    <Stack hasGutter>
      <StackItem>
        <SwitchField
          name="enableDiskEncryptionOnMasters"
          label={`Enable encryption of installation disks${
            !isSNO ? ' on control plane nodes' : ''
          }`}
          isDisabled={isDisabled}
        />
      </StackItem>
      <RenderIf condition={!isSNO}>
        <StackItem>
          <SwitchField
            name="enableDiskEncryptionOnWorkers"
            isDisabled={isDisabled}
            label="Enable encryption of installation disks on workers"
          />
        </StackItem>
      </RenderIf>
      <RenderIf
        condition={enableDiskEncryptionOnMasters || (enableDiskEncryptionOnWorkers && !isSNO)}
      >
        <StackItem>
          <DiskEncryptionMode diskEncryptionMode={diskEncryptionMode} isDisabled={isDisabled} />
        </StackItem>
      </RenderIf>
    </Stack>
  );
};

export default DiskEncryptionControlGroup;
