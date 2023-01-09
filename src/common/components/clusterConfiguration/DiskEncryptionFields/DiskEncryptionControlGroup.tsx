import React from 'react';
import isEqual from 'lodash/isEqual';
import { Alert, AlertVariant, FlexItem, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import SwitchField from '../../ui/formik/SwitchField';
import { DiskEncryptionMode } from './DiskEncryptionMode';
import { RenderIf } from '../../ui';
import { DiskEncryptionValues, TangServer } from './DiskEncryptionValues';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

const hasFilledTangServers = (tangServers: TangServer[]): boolean => {
  if (!tangServers || tangServers.length === 0) {
    return false;
  }

  const emptyServer = {
    url: '',
    thumbprint: '',
  };
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

const DiskEncryptionControlGroup = ({
  values,
  isSNO = false,
  isDisabled = false,
}: DiskEncryptionControlGroupProps) => {
  const {
    enableDiskEncryptionOnMasters,
    enableDiskEncryptionOnWorkers,
    diskEncryptionMode,
    diskEncryptionTangServers,
  } = values;

  const hasEnabledDiskEncryption = enableDiskEncryptionOnMasters || enableDiskEncryptionOnWorkers;
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
  const { t } = useTranslation();
  const disableMessage = t('ai:This option is not editable after the draft cluster is created');
  const tooltipProps = {
    hidden: !isDisabled,
    content: disableMessage,
  };

  return (
    <FormGroup label="Encryption of installation disks">
      <Stack hasGutter>
        <StackItem>
          <SwitchField
            tooltipProps={tooltipProps}
            name="enableDiskEncryptionOnMasters"
            label={isSNO ? t('ai:Control plane node, worker') : t('ai:Control plane nodes')}
            isDisabled={isDisabled}
          />
        </StackItem>
        <RenderIf condition={!isSNO}>
          <StackItem>
            <SwitchField
              tooltipProps={tooltipProps}
              name="enableDiskEncryptionOnWorkers"
              isDisabled={isDisabled}
              label={t('ai:Workers')}
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
      {hasEnabledDiskEncryption && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              {diskEncryptionMode === 'tpmv2' && (
                <>
                  To use this encryption method, enable TPMv2 encryption in the BIOS of each
                  selected host.
                </>
              )}
              {diskEncryptionMode === 'tang' && (
                <>
                  The use of Tang encryption mode to encrypt your disks is only supported for bare
                  metal or vSphere installations on user-provisioned infrastructure.
                </>
              )}
            </FlexItem>
          }
        />
      )}
    </FormGroup>
  );
};

export default DiskEncryptionControlGroup;
