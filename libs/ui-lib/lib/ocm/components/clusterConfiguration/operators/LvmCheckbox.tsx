import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import {
  ClusterOperatorProps,
  getFieldId,
  PopoverIcon,
  operatorLabels,
  OPERATOR_NAME_LVM,
  ExposedOperatorName,
  ExternalLink,
  OPERATOR_NAME_LVMS,
  getLvmsDocsLink,
} from '../../../../common';
import LvmHostRequirements from './LvmHostRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
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
        <span>{operatorLabel} </span>
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
  disabledReason,
  supportLevel,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  openshiftVersion?: ClusterOperatorProps['openshiftVersion'];
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(LVM_FIELD_NAME, 'input');

  const featureSupportLevel = useNewFeatureSupportLevel();
  const { t } = useTranslation();

  const operatorInfo = React.useMemo(() => {
    const operatorLabel = operatorLabels(t, featureSupportLevel)[OPERATOR_NAME_LVM];
    return {
      operatorLabel,
      operatorName: supportLevel === 'supported' ? OPERATOR_NAME_LVMS : OPERATOR_NAME_LVM,
    };
  }, [featureSupportLevel, supportLevel, t]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LVM_FIELD_NAME}
        label={
          <LvmLabel
            clusterId={clusterId}
            operatorLabel={operatorInfo.operatorLabel}
            disabledReason={disabledReason}
            supportLevel={supportLevel}
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
