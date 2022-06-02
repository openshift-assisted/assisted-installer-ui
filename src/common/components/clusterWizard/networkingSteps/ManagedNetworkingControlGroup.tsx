import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { getFieldId } from '../../ui';
import RadioFieldWithTooltip from '../../ui/formik/RadioFieldWithTooltip';
export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
  tooltip?: string;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltip,
}: ManagedNetworkingControlGroupProps) => {
  const tooltipProps: TooltipProps = {
    hidden: !tooltip || !disabled,
    content: tooltip,
    position: 'top',
  };

  return (
    <FormGroup label="Network Management" fieldId={getFieldId(GROUP_NAME, 'radio')} isInline>
      <RadioFieldWithTooltip
        tooltipProps={tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'clusterManaged'}
        label="Cluster-Managed Networking"
      />
      <RadioFieldWithTooltip
        tooltipProps={tooltipProps}
        name={GROUP_NAME}
        isDisabled={disabled}
        value={'userManaged'}
        label="User-Managed Networking"
      />
    </FormGroup>
  );
};
