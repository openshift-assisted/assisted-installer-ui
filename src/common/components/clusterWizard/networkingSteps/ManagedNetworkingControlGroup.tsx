import React from 'react';
import { Split, SplitItem } from '@patternfly/react-core';
import { RadioField } from '../../ui';
export interface ManagedNetworkingControlGroupProps {
  disabled: boolean;
}

export const ManagedNetworkingControlGroup = ({
  disabled = false,
}: ManagedNetworkingControlGroupProps) => {
  const GROUP_NAME = 'managedNetworkingType';

  return (
    <Split hasGutter>
      <SplitItem>
        <RadioField
          name={GROUP_NAME}
          isDisabled={disabled}
          value={'clusterManaged'}
          label="Cluster-Managed Networking"
        />
      </SplitItem>
      <SplitItem />
      <SplitItem>
        <RadioField
          name={GROUP_NAME}
          isDisabled={disabled}
          value={'userManaged'}
          label="User-Managed Networking"
        />
      </SplitItem>
    </Split>
  );
};
