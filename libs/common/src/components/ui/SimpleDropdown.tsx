import React from 'react';
import {
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownPopperProps,
} from '@patternfly/react-core';
import { HostRole } from '../../types/hosts';
import './SimpleDropdown.css';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: HostRole[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
  idPrefix?: string;
  menuAppendTo?: DropdownPopperProps['appendTo'];
};

export const SimpleDropdown = ({
  current,
  defaultValue,
  items,
  setValue,
  isDisabled,
  idPrefix,
  menuAppendTo,
}: SimpleDropdownProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const dropdownItems = items.map(({ value, label, description }) => (
    <DropdownItem key={value} id={value} description={description}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.MouseEvent<Element, MouseEvent>) => {
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setValue, setOpen],
  );

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
      className="role-dropdown"
      ref={toggleRef}
      variant="plainText"
      onClick={() => setOpen(!isOpen)}
      isDisabled={isDisabled}
      isExpanded={isOpen}
      data-testid="simple-dropdown-toggle"
    >
      {current || defaultValue}
    </MenuToggle>
  );

  return (
    <Dropdown
      onSelect={onSelect}
      onOpenChange={() => setOpen(!isOpen)}
      toggle={toggle}
      isOpen={isOpen}
      id={idPrefix ? `${idPrefix}-dropdown-toggle` : undefined}
      popperProps={{ appendTo: menuAppendTo }}
    >
      {dropdownItems}
    </Dropdown>
  );
};
