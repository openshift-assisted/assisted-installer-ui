import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useFormikContext } from 'formik';
import {
  CheckboxField,
  ClusterOperatorProps,
  FeatureSupportLevelBadge,
  getFieldId,
  LVM_LINK,
  OPERATOR_NAME_LVM,
  OperatorsValues,
  PopoverIcon,
  useFeatureSupportLevel,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { getCnvAndLvmIncompatibilityReason } from '../../featureSupportLevels/featureStateUtils';

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
  const fieldId = getFieldId(LVM_FIELD_NAME, 'input');

  const featureSupportLevel = useFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let reason = undefined;
    if (openshiftVersion) {
      reason = featureSupportLevel.getFeatureDisabledReason(openshiftVersion, 'LVM');
      if (!reason) {
        reason = getCnvAndLvmIncompatibilityReason(values, openshiftVersion, OPERATOR_NAME_LVM);
      }
    }
    setDisabledReason(reason);
  }, [values, openshiftVersion, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <CheckboxField
          name={LVM_FIELD_NAME}
          label={<LvmLabel clusterId={clusterId} openshiftVersion={openshiftVersion} />}
          helperText={<LvmHelperText />}
          isDisabled={!!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};

export default LvmCheckbox;
