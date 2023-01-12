import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown, DropdownProps } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { HostRole } from '../../../common/types/hosts';
import './SimpleDropdown.css';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: HostRole[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
  idPrefix?: string;
  position?: DropdownProps['position'];
  menuAppendTo?: DropdownProps['menuAppendTo'];
};

export const SimpleDropdown = ({
  current,
  defaultValue,
  items,
  setValue,
  isDisabled,
  idPrefix,
  position,
  menuAppendTo,
}: SimpleDropdownProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const dropdownItems = items.map(({ value, label, description }) => (
    <DropdownItem key={value} id={value} description={description}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setValue, setOpen],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
        className="role-dropdown"
      >
        {current || defaultValue}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled, defaultValue, idPrefix],
  );

  return (
    <Dropdown
      onSelect={onSelect}
      dropdownItems={dropdownItems}
      toggle={toggle}
      isOpen={isOpen}
      isPlain
      id={idPrefix ? `${idPrefix}-dropdown-toggle` : undefined}
      position={position}
      menuAppendTo={menuAppendTo}
    />
  );
};
