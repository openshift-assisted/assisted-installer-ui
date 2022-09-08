import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  getFieldId,
  useFeatureSupportLevel,
  CheckboxField,
  FeatureSupportLevelBadge,
  PopoverIcon,
  LVM_LINK,
  ClusterOperatorProps,
  OperatorsValues,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { useFormikContext } from 'formik';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

const LvmLabel = (props: ClusterOperatorProps) => (
  <>
    Install OpenShift Data Foundation Logical Volume Manager{' '}
    <PopoverIcon
      component={'a'}
      headerContent="Additional Requirements"
      bodyContent={<LvmHostRequirements clusterId={props.clusterId} />}
    />
    <FeatureSupportLevelBadge featureId="LVM" openshiftVersion={props.openshiftVersion} />
  </>
);

const LvmHelperText = () => {
  return (
    <>
      Storage virtualization that offers a more flexible approach for disk space management.{' '}
      <a href={LVM_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

const LvmCheckbox = ({ clusterId, openshiftVersion }: ClusterOperatorProps) => {
  const featureSupportLevelContext = useFeatureSupportLevel();
  const fieldId = getFieldId(LVM_FIELD_NAME, 'input');

  const { values } = useFormikContext<OperatorsValues>();
  const disabled = values.useContainerNativeVirtualization;

  let disabledReason = openshiftVersion
    ? featureSupportLevelContext.getFeatureDisabledReason(openshiftVersion, 'LVM')
    : undefined;

  if (disabled) {
    disabledReason = 'INcompatible';
  }
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <>
          <CheckboxField
            name={LVM_FIELD_NAME}
            label={<LvmLabel clusterId={clusterId} openshiftVersion={openshiftVersion} />}
            helperText={<LvmHelperText />}
            style={{ border: disabledReason ? '2px solid red' : 'none' }}
          />
        </>
      </Tooltip>
    </FormGroup>
  );
};

export default LvmCheckbox;
