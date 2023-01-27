import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import {
  ClusterOperatorProps,
  getFieldId,
  PopoverIcon,
  useFeatureSupportLevel,
  operatorLabels,
  OperatorsValues,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { handleLVMS } from './utils';
import { useFormikContext } from 'formik';
import { getLvmIncompatibleWithCnvReason } from '../../featureSupportLevels/featureStateUtils';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

type LvmLabelProps = ClusterOperatorProps; // & { operator: ExposedOperatorName };

const LvmLabel = ({ openshiftVersion, clusterId }: LvmLabelProps) => {
  const { t } = useTranslation();
  const [operator, setOperator] = React.useState('');

  const featureSupportLevel = useFeatureSupportLevel();
  React.useEffect(() => {
    setOperator(handleLVMS({ openshiftVersion, featureSupportLevel }));
  }, [featureSupportLevel, openshiftVersion]);

  const operatorName = operatorLabels(t)[operator];

  return (
    <>
      Install {operatorName}{' '}
      <PopoverIcon
        component={'a'}
        headerContent="Additional Requirements"
        bodyContent={<LvmHostRequirements clusterId={clusterId} />}
      />
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
      const lvmSupport = featureSupportLevel.getFeatureSupportLevel(openshiftVersion, 'LVM');
      reason = getLvmIncompatibleWithCnvReason(values, lvmSupport);
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
