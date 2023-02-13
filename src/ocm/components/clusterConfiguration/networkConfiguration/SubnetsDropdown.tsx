import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { getFieldId } from '../../../../common';

type SubnetsDropdownProps = {
  name: string;
  items: {
    label: string;
    value: string;
    isDisabled?: boolean;
  }[];
  isDisabled: boolean;
  defaultValue: string;
};

export const SubnetsDropdown = ({
  name,
  items,
  isDisabled,
  defaultValue,
}: SubnetsDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const fieldId = getFieldId(name, 'input');
  const dropdownItems = items.map(({ value, label, isDisabled }) => (
    <DropdownItem key={value} id={value} isDisabled={isDisabled}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const currentValue = event?.currentTarget.innerText
        ? event?.currentTarget.innerText
        : defaultValue;
      setCurrent(currentValue ? currentValue : '');
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setCurrent, setOpen, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        isText
        className="pf-u-w-100"
      >
        {current}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled],
  );

  return (
    <Dropdown
      {...field}
      name={name}
      id={fieldId}
      onSelect={onSelect}
      dropdownItems={dropdownItems}
      toggle={toggle}
      isOpen={isOpen}
      className="pf-u-w-100"
    />
  );
};
