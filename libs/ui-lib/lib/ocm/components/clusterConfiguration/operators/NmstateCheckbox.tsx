import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon, ClusterOperatorProps } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NmstateRequirements from './NmstateRequirements';

const NMSTATE_FIELD_NAME = 'useNmstate';

const NmstateLabel = ({
  disabledReason,
  clusterId,
}: {
  disabledReason?: string;
  clusterId: ClusterOperatorProps['clusterId'];
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
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NMSTATE_FIELD_NAME}
        label={<NmstateLabel clusterId={clusterId} disabledReason={disabledReason} />}
        helperText={<NmstateHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NmstateCheckbox;
