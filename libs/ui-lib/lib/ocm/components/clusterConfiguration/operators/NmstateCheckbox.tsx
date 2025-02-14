import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon, ClusterOperatorProps } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NmstateRequirements from './NmstateRequirements';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const NMSTATE_FIELD_NAME = 'useNmstate';

const NmstateLabel = ({
  disabledReason,
  clusterId,
  supportLevel,
}: {
  disabledReason?: string;
  clusterId: ClusterOperatorProps['clusterId'];
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install NMState </span>
      </Tooltip>
      <PopoverIcon
        id={NMSTATE_FIELD_NAME}
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={<NmstateRequirements clusterId={clusterId} />}
      />
      <NewFeatureSupportLevelBadge featureId="NMSTATE" supportLevel={supportLevel} />
    </>
  );
};

const NmstateHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Provides users with functionality to configure various network interface types, DNS, and
        routing on cluster nodes.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const NmstateCheckbox = ({
  clusterId,
  disabledReason,
}: {
  clusterId: ClusterOperatorProps['clusterId'];
  disabledReason?: string;
}) => {
  const fieldId = getFieldId(NMSTATE_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonNmstate, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('NMSTATE');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NMSTATE_FIELD_NAME}
        label={
          <NmstateLabel
            clusterId={clusterId}
            disabledReason={disabledReason ? disabledReason : disabledReasonNmstate}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('NMSTATE')}
          />
        }
        helperText={<NmstateHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonNmstate}
      />
    </FormGroup>
  );
};

export default NmstateCheckbox;
