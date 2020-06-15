import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

type SimpleDropdownProps = {
  current?: string;
  values: string[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
};

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  current,
  values,
  setValue,
  isDisabled,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const items = values.map((value) => (
    <DropdownItem key={value} id={value}>
      {value}
    </DropdownItem>
  ));

  const onRoleSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setValue, setOpen],
  );

  const roleToggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
      >
        {current || 'Please select'}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled],
  );

  return (
    <Dropdown
      onSelect={onRoleSelect}
      dropdownItems={items}
      toggle={roleToggle}
      isOpen={isOpen}
      isPlain
    />
  );
};
