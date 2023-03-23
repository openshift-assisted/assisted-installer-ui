import React, { useState } from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import {
  ClusterOperatorProps,
  getFieldId,
  PopoverIcon,
  operatorLabels,
  OperatorsValues,
  OPERATOR_NAME_LVM,
  ExposedOperatorName,
  ExternalLink,
  LVMS_LINK,
  OPERATOR_NAME_LVMS,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getLvmIncompatibleWithCnvReason } from '../../featureSupportLevels/featureStateUtils';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

type LvmLabelProps = ClusterOperatorProps & { disabledReason?: string; operatorLabel: string };

const LvmHelperText = ({ operatorName }: { operatorName: ExposedOperatorName }) => {
  return (
    <>
      Storage virtualization that offers a more flexible approach for disk space management.{' '}
      {operatorName === OPERATOR_NAME_LVMS && (
        <ExternalLink href={LVMS_LINK}>Learn more</ExternalLink>
      )}
    </>
  );
};

const LvmLabel = ({
  openshiftVersion,
  clusterId,
  operatorLabel,
  disabledReason,
}: LvmLabelProps) => {
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
      <NewFeatureSupportLevelBadge featureId="LVM" openshiftVersion={openshiftVersion} />
    </>
  );
};

const LvmCheckbox = ({ clusterId, openshiftVersion }: ClusterOperatorProps) => {
  const fieldId = getFieldId(LVM_FIELD_NAME, 'input');

  const featureSupportLevel = useNewFeatureSupportLevel();
  const { t } = useTranslation();
  const { values } = useFormikContext<OperatorsValues>();
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  const operatorInfo = React.useMemo(() => {
    const lvmSupport = featureSupportLevel.getFeatureSupportLevel('LVM');

    const operatorLabel = operatorLabels(t, featureSupportLevel)[OPERATOR_NAME_LVM];
    return {
      lvmSupport,
      operatorLabel,
      operatorName: lvmSupport === 'supported' ? OPERATOR_NAME_LVMS : OPERATOR_NAME_LVM,
    };
  }, [t, featureSupportLevel]);

  React.useEffect(() => {
    let reason = undefined;
    if (openshiftVersion) {
      reason = featureSupportLevel.getFeatureDisabledReason('LVM');
      if (!reason) {
        reason = getLvmIncompatibleWithCnvReason(values, operatorInfo.lvmSupport);
      }
    }
    setDisabledReason(reason);
  }, [values, openshiftVersion, featureSupportLevel, operatorInfo.lvmSupport]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LVM_FIELD_NAME}
        label={
          <LvmLabel
            clusterId={clusterId}
            openshiftVersion={openshiftVersion}
            operatorLabel={operatorInfo.operatorLabel}
            disabledReason={disabledReason}
          />
        }
        helperText={<LvmHelperText operatorName={operatorInfo.operatorName} />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LvmCheckbox;
