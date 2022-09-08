import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  CheckboxField,
  PopoverIcon,
  getFieldId,
  useFeatureSupportLevel,
  CNV_LINK,
  ClusterOperatorProps,
} from '../../../../common';
import CnvHostRequirements from './CnvHostRequirements';

const CNV_FIELD_NAME = 'useContainerNativeVirtualization';

const CnvLabel = ({ clusterId }: { clusterId: ClusterOperatorProps['clusterId'] }) => {
  return (
    <>
      Install OpenShift Virtualization{' '}
      <PopoverIcon
        component={'a'}
        headerContent="Additional Requirements"
        bodyContent={<CnvHostRequirements clusterId={clusterId} />}
      />
    </>
  );
};

const CnvHelperText = () => {
  return (
    <>
      Run virtual machines alongside containers on one platform.{' '}
      <a href={CNV_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

const CnvCheckbox = ({ clusterId, openshiftVersion }: ClusterOperatorProps) => {
  const featureSupportLevelContext = useFeatureSupportLevel();
  const fieldId = getFieldId(CNV_FIELD_NAME, 'input');
  const disabledReason = openshiftVersion
    ? featureSupportLevelContext.getFeatureDisabledReason(openshiftVersion, 'CNV')
    : undefined;
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <CheckboxField
          name={CNV_FIELD_NAME}
          label={<CnvLabel clusterId={clusterId} />}
          helperText={<CnvHelperText />}
          style={{ border: disabledReason ? '2px solid red' : 'none' }}
        />
      </Tooltip>
    </FormGroup>
  );
};

export default CnvCheckbox;
