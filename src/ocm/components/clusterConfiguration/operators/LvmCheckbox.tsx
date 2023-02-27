import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import {
  ClusterOperatorProps,
  getFieldId,
  PopoverIcon,
  useFeatureSupportLevel,
  operatorLabels,
  OperatorsValues,
  FeatureSupportLevelBadge,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getActualLVMOperatorName } from './utils';
import { useFormikContext } from 'formik';
import { getLvmIncompatibleWithCnvReason } from '../../featureSupportLevels/featureStateUtils';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

type LvmLabelProps = ClusterOperatorProps & { disabledReason?: string };

const LvmLabel = ({ openshiftVersion, clusterId, disabledReason }: LvmLabelProps) => {
  const { t } = useTranslation();
  const [operator, setOperator] = React.useState('');

  const featureSupportLevel = useFeatureSupportLevel();
  React.useEffect(() => {
    setOperator(getActualLVMOperatorName({ openshiftVersion, featureSupportLevel }));
  }, [featureSupportLevel, openshiftVersion]);

  const operatorLabel = operatorLabels(t)[operator];

  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install {operatorLabel} </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Additional Requirements"
        bodyContent={<LvmHostRequirements clusterId={clusterId} />}
      />
      <FeatureSupportLevelBadge featureId="LVM" openshiftVersion={openshiftVersion} />
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
        const lvmSupport = featureSupportLevel.getFeatureSupportLevel(openshiftVersion, 'LVM');
        reason = getLvmIncompatibleWithCnvReason(values, lvmSupport);
      }
    }
    setDisabledReason(reason);
  }, [values, openshiftVersion, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LVM_FIELD_NAME}
        label={
          <LvmLabel
            clusterId={clusterId}
            openshiftVersion={openshiftVersion}
            disabledReason={disabledReason}
          />
        }
        helperText={
          'Storage virtualization that offers a more flexible approach for disk space management.'
        }
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LvmCheckbox;
