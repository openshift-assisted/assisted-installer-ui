import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: { [key: string]: string };
  setValue: (value?: string) => void;
  isDisabled: boolean;
};

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  current,
  defaultValue,
  items,
  setValue,
  isDisabled,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const dropdownItems = Object.keys(items).map((key) => (
    <DropdownItem key={key} id={key}>
      {items[key]}
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
      >
        {current || defaultValue}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled, defaultValue],
  );

  return (
    <Dropdown
      onSelect={onSelect}
      dropdownItems={dropdownItems}
      toggle={toggle}
      isOpen={isOpen}
      isPlain
    />
  );
};
