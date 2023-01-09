import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import {
  ClusterOperatorProps,
  FeatureSupportLevelBadge,
  getFieldId,
  OperatorsValues,
  PopoverIcon,
  useFeatureSupportLevel,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { getLvmIncompatibleWithCnvReason } from '../../featureSupportLevels/featureStateUtils';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

const LvmLabel = (props: ClusterOperatorProps) => (
  <>
    Install OpenShift Data Foundation Logical Volume Manager Storage{' '}
    <PopoverIcon
      component={'a'}
      headerContent="Additional Requirements"
      bodyContent={<LvmHostRequirements clusterId={props.clusterId} />}
    />
    <FeatureSupportLevelBadge featureId="LVM" openshiftVersion={props.openshiftVersion} />
  </>
);

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
        const lvmSupport = featureSupportLevel.getFeatureSupportLevel(openshiftVersion, 'LVM');
        reason = getLvmIncompatibleWithCnvReason(values, openshiftVersion, lvmSupport);
      }
    }
    setDisabledReason(reason);
  }, [values, openshiftVersion, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <OcmCheckboxField
          name={LVM_FIELD_NAME}
          label={<LvmLabel clusterId={clusterId} openshiftVersion={openshiftVersion} />}
          helperText={
            'Storage virtualization that offers a more flexible approach for disk space management.'
          }
          isDisabled={!!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};

export default LvmCheckbox;
