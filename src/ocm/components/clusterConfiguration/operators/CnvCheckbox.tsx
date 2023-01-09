import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useFormikContext } from 'formik';
import {
  ClusterOperatorProps,
  CNV_LINK,
  getFieldId,
  OperatorsValues,
  PopoverIcon,
  useFeatureSupportLevel,
} from '../../../../common';
import CnvHostRequirements from './CnvHostRequirements';
import { getCnvIncompatibleWithLvmReason } from '../../featureSupportLevels/featureStateUtils';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

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
  const fieldId = getFieldId(CNV_FIELD_NAME, 'input');

  const featureSupportLevel = useFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let reason = undefined;
    if (openshiftVersion) {
      reason = featureSupportLevel.getFeatureDisabledReason(openshiftVersion, 'CNV');
      if (!reason) {
        const lvmSupport = featureSupportLevel.getFeatureSupportLevel(openshiftVersion, 'LVM');
        reason = getCnvIncompatibleWithLvmReason(values, openshiftVersion, lvmSupport);
      }
    }
    setDisabledReason(reason);
  }, [values, openshiftVersion, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <OcmCheckboxField
          name={CNV_FIELD_NAME}
          label={<CnvLabel clusterId={clusterId} />}
          helperText={<CnvHelperText />}
          isDisabled={!!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};

export default CnvCheckbox;
