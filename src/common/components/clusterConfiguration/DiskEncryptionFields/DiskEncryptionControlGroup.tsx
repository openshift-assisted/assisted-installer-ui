import React from 'react';
import isEqual from 'lodash/isEqual';
import { Stack, StackItem } from '@patternfly/react-core';
import SwitchField from '../../ui/formik/SwitchField';
import { DiskEncryptionMode } from './DiskEncryptionMode';
import { RenderIf } from '../../ui';
import { DiskEncryptionValues, TangServer } from './DiskEncryptionValues';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';

const hasFilledTangServers = (tangServers: TangServer[]): boolean => {
  if (!tangServers || tangServers.length === 0) {
    return false;
  }

  const emptyServer = [
    {
      url: '',
      thumbprint: '',
    },
  ];
  return (
    tangServers.find(
      (server: typeof tangServers[number]) => !isEqual(server, emptyServer) && !isEqual(server, {}),
    ) !== undefined
  );
};

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
    diskEncryptionTangServers,
  } = values;

  const { setFieldValue, setFieldTouched } = useFormikContext<ClusterDetailsValues>();

  React.useEffect(() => {
    if (!enableDiskEncryptionOnWorkers && !enableDiskEncryptionOnMasters) {
      if (diskEncryptionMode !== 'tpmv2') {
        setFieldValue('diskEncryptionMode', 'tpmv2');
      }
      if (hasFilledTangServers(diskEncryptionTangServers)) {
        setFieldTouched('diskEncryptionTangServers', false, false);
        setFieldValue('diskEncryptionTangServers', [{}], false);
      }
    }
  }, [
    enableDiskEncryptionOnMasters,
    enableDiskEncryptionOnWorkers,
    diskEncryptionMode,
    diskEncryptionTangServers,
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
