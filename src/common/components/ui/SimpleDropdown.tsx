import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown, DropdownProps } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { HostRoleItem } from '../../../common/types/hosts';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: HostRoleItem[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
  idPrefix?: string;
  position?: DropdownProps['position'];
};

export const SimpleDropdown = ({
  current,
  defaultValue,
  items,
  setValue,
  isDisabled,
  idPrefix,
  position,
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
        isText
        id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
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
    />
  );
};
