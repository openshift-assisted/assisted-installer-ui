import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';

type ChangeHostnameActionProps = {
  onChangeHostname: VoidFunction;
};

export const ChangeHostnameAction: React.FC<ChangeHostnameActionProps> = ({ onChangeHostname }) => (
  <DropdownItem onClick={onChangeHostname}>Change hostname</DropdownItem>
);

type DeleteHostActionProps = {
  onDeleteHost: VoidFunction;
};

export const DeleteHostAction: React.FC<DeleteHostActionProps> = ({ onDeleteHost }) => (
  <DropdownItem onClick={onDeleteHost}>Delete</DropdownItem>
);
