import React from 'react';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { HostRole } from '../../../common/types/hosts';
import './SimpleDropdown.css';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: HostRole[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
  idPrefix?: string;
  menuAppendTo?: HTMLElement | (() => HTMLElement) | 'inline' | undefined;
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
    <DropdownItem key={value} id={value} value={value} description={description}>
      ({label})
    </DropdownItem>
  ));

  const onSelect = (
    event: React.MouseEvent | React.KeyboardEvent | undefined,
    value: string | number | undefined,
  ) => {
    setValue(value as string);
    setOpen(false);
  };

  const toggle = React.useMemo(
    () => (toggleRef: React.RefObject<any>) =>
      (
        <MenuToggle
          onClick={() => setOpen(!isDisabled && !isOpen)}
          isDisabled={isDisabled}
          ref={toggleRef}
          id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
          className="role-dropdown"
          isExpanded={isOpen}
        >
          {current || defaultValue}
        </MenuToggle>
      ),
    [current, defaultValue, isDisabled, isOpen, idPrefix],
  );

  return (
    <Dropdown
      onSelect={onSelect}
      toggle={toggle}
      isOpen={isOpen}
      isPlain
      id={idPrefix ? `${idPrefix}-dropdown-toggle` : undefined}
      popperProps={{ appendTo: menuAppendTo }}
    >
      {dropdownItems}
    </Dropdown>
  );
};
