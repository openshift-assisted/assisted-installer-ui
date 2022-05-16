import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import SwitchField from '../../ui/formik/SwitchField';
import { DiskEncryptionMode } from './DiskEncryptionMode';
import { RenderIf } from '../../ui';
import { DiskEncryptionValues } from './DiskEncryptionValues';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';

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
  const { enableDiskEncryptionOnMasters, enableDiskEncryptionOnWorkers, diskEncryptionMode } =
    values;

  const { setFieldValue, setFieldTouched } = useFormikContext<ClusterDetailsValues>();

  React.useEffect(() => {
    if (!enableDiskEncryptionOnWorkers && !enableDiskEncryptionOnMasters) {
      setFieldValue('diskEncryptionMode', 'tpmv2');
      setFieldTouched('diskEncryptionTangServers', false, false);
      setFieldValue('diskEncryptionTangServers', [{}], false);
    }
  }, [
    enableDiskEncryptionOnMasters,
    enableDiskEncryptionOnWorkers,
    setFieldTouched,
    setFieldValue,
  ]);

  React.useEffect(() => {
    if (isSNO) {
      setFieldValue('enableDiskEncryptionOnWorkers', false);
    }
  }, [isSNO, setFieldValue]);

  const disableMessage = 'This option is not editable after the draft cluster is created';
  const tooltipProps = {
    hidden: !isDisabled,
    content: disableMessage,
  };
  return (
    <Stack hasGutter>
      <StackItem>
        <SwitchField
          tooltipProps={tooltipProps}
          name="enableDiskEncryptionOnMasters"
          label={`Enable encryption of installation disk${
            !isSNO ? 's on control plane nodes' : ''
          }`}
          isDisabled={isDisabled}
        />
      </StackItem>
      <RenderIf condition={!isSNO}>
        <StackItem>
          <SwitchField
            tooltipProps={tooltipProps}
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
