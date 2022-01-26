import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../../ui';
export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
}

export const ManagedNetworkingControlGroup = ({
  disabled = false,
}: ManagedNetworkingControlGroupProps) => {
  const GROUP_NAME = 'managedNetworkingType';

  return (
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
  );
};
