import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { ActionItemsContext } from './HostToolbar';

type ChangeHostnameActionProps = {
  onChangeHostname: VoidFunction;
};

export const ChangeHostnameAction: React.FC<ChangeHostnameActionProps> = ({ onChangeHostname }) => {
  const isDisabled = React.useContext(ActionItemsContext);
  return (
    <DropdownItem
      onClick={onChangeHostname}
      isDisabled={isDisabled}
      description={isDisabled ? 'Select one or more hosts to change hostname' : undefined}
    >
      Change hostname
    </DropdownItem>
  );
};
