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
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';

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

  const disabledReason = openshiftVersion
    ? featureSupportLevelContext.getFeatureDisabledReason(openshiftVersion, 'LVM')
    : undefined;
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <>
          <CheckboxField
            name={LVM_FIELD_NAME}
            label={<LvmLabel clusterId={clusterId} openshiftVersion={openshiftVersion} />}
            isDisabled={!!disabledReason}
            helperText={<LvmHelperText />}
          />
        </>
      </Tooltip>
    </FormGroup>
  );
};

export default LvmCheckbox;
