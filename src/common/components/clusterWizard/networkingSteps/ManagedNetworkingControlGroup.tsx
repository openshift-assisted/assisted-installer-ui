import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../../ui';
export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
  tooltip?: string;
}

const GROUP_NAME = 'managedNetworkingType';
export const ManagedNetworkingControlGroup = ({
  disabled = false,
  tooltip,
}: ManagedNetworkingControlGroupProps) => {
  return (
    <Tooltip hidden={!tooltip || !disabled} content={tooltip} position={'top-start'}>
      <FormGroup label="Network Management" fieldId={getFieldId(GROUP_NAME, 'radio')} isInline>
        <RadioField
          name={GROUP_NAME}
          isDisabled={disabled}
          value={'clusterManaged'}
          label="Cluster-Managed Networking"
        />
        <RadioField
          name={GROUP_NAME}
          isDisabled={disabled}
          value={'userManaged'}
          label="User-Managed Networking"
        />
      </FormGroup>
    </Tooltip>
  );
};
