import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const NODEFEATUREDISCOVERY_FIELD_NAME = 'useNodeFeatureDiscovery';

const NodeFeatureDiscoveryLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Node Feature Discovery</span>
      </Tooltip>
      <PopoverIcon
        id={NODEFEATUREDISCOVERY_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const NodeFeatureDiscoveryHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Manage the detection of hardware features and configuration by labeling nodes with
        hardware-specific information.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const NodeFeatureDiscoveryCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(NODEFEATUREDISCOVERY_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NODEFEATUREDISCOVERY_FIELD_NAME}
        label={<NodeFeatureDiscoveryLabel disabledReason={disabledReason} />}
        helperText={<NodeFeatureDiscoveryHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NodeFeatureDiscoveryCheckbox;
