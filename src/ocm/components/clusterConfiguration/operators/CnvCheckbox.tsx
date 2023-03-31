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
} from '../../../../common';
import CnvHostRequirements from './CnvHostRequirements';
import { getCnvIncompatibleWithLvmReason } from '../../featureSupportLevels/featureStateUtils';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const CNV_FIELD_NAME = 'useContainerNativeVirtualization';

const CnvLabel = ({
  clusterId,
  disabledReason,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install OpenShift Virtualization </span>
      </Tooltip>
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

const CnvCheckbox = ({ clusterId }: ClusterOperatorProps) => {
  const fieldId = getFieldId(CNV_FIELD_NAME, 'input');

  const featureSupportLevel = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let reason = featureSupportLevel.getFeatureDisabledReason('CNV');
    if (!reason) {
      const lvmSupport = featureSupportLevel.getFeatureSupportLevel('LVM');
      reason = getCnvIncompatibleWithLvmReason(values, lvmSupport);
    }
    setDisabledReason(reason);
  }, [values, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={CNV_FIELD_NAME}
        label={<CnvLabel clusterId={clusterId} disabledReason={disabledReason} />}
        helperText={<CnvHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default CnvCheckbox;
