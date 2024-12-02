import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
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
  OPERATOR_NAME_LVMS,
  getLvmsDocsLink,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import {
  getLvmIncompatibleWithCnvReason,
  getLvmsIncompatibleWithOdfReason,
} from '../../featureSupportLevels/featureStateUtils';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

const LVM_FIELD_NAME = 'useOdfLogicalVolumeManager';

type LvmLabelProps = ClusterOperatorProps & {
  disabledReason?: string;
  operatorLabel: string;
  supportLevel?: SupportLevel;
};

const LvmHelperText = ({
  operatorName,
  docsVersion,
}: {
  operatorName: ExposedOperatorName;
  docsVersion: string;
}) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Storage virtualization that offers a more flexible approach for disk space management.{' '}
        {operatorName === OPERATOR_NAME_LVMS && (
          <ExternalLink href={getLvmsDocsLink(docsVersion)}>Learn more</ExternalLink>
        )}
      </HelperTextItem>
    </HelperText>
  );
};

const LvmLabel = ({ clusterId, operatorLabel, disabledReason, supportLevel }: LvmLabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install {operatorLabel} </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={<LvmHostRequirements clusterId={clusterId} />}
      />
      <NewFeatureSupportLevelBadge featureId="LVM" supportLevel={supportLevel} />
    </>
  );
};

const LvmCheckbox = ({
  clusterId,
  openshiftVersion,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  openshiftVersion?: ClusterOperatorProps['openshiftVersion'];
}) => {
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
    let reason = featureSupportLevel.getFeatureDisabledReason('LVM');
    if (!reason) {
      reason = getLvmIncompatibleWithCnvReason(values, operatorInfo.lvmSupport);
      if (!reason) {
        reason = getLvmsIncompatibleWithOdfReason(values);
      }
    }
    setDisabledReason(reason);
  }, [values, featureSupportLevel, operatorInfo.lvmSupport]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LVM_FIELD_NAME}
        label={
          <LvmLabel
            clusterId={clusterId}
            operatorLabel={operatorInfo.operatorLabel}
            disabledReason={disabledReason}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('LVM')}
          />
        }
        helperText={
          <LvmHelperText
            operatorName={operatorInfo.operatorName}
            docsVersion={openshiftVersion || ''}
          />
        }
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LvmCheckbox;
