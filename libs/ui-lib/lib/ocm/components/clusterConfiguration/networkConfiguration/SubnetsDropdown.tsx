import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { getFieldId, HostSubnet, NO_SUBNET_SET } from '../../../../common';

type SubnetsDropdownProps = {
  name: string;
  machineSubnets: HostSubnet[];
  isDisabled: boolean;
};

const toFormSelectOptions = (subnets: HostSubnet[]) => {
  return subnets.map((hn, index) => ({
    label: `${hn.humanized}${hn.isValid ? '' : ' (Invalid network)'}`,
    value: hn.subnet,
    isDisabled: false,
    id: `form-input-hostSubnet-field-option-${index}`,
  }));
};

const makeNoSubnetSelectedOption = (availableSubnets: number) => ({
  label: `Please select a subnet. (${availableSubnets} available)`,
  value: NO_SUBNET_SET,
  isDisabled: true,
  id: 'form-input-hostSubnet-field-option-no-subnet-selected',
});

const noSubnetAvailableOption = {
  label: 'No subnets are currently available',
  value: NO_SUBNET_SET,
  isDisabled: true,
  id: 'form-input-hostSubnet-field-option-no-subnet-available',
};

export const SubnetsDropdown = ({ name, machineSubnets, isDisabled }: SubnetsDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState('');
  const fieldId = getFieldId(name, 'input');

  const itemsSubnets = React.useMemo(() => {
    return machineSubnets.length === 0
      ? [noSubnetAvailableOption]
      : [makeNoSubnetSelectedOption(machineSubnets.length)].concat(
          toFormSelectOptions(machineSubnets),
        );
  }, [machineSubnets]);

  React.useEffect(() => {
    const defaultValue = itemsSubnets.length > 1 ? itemsSubnets[1].label : itemsSubnets[0].label;
    setCurrent(defaultValue);
  }, [setCurrent, itemsSubnets]);

  const dropdownItems = itemsSubnets.map(({ value, label, isDisabled }) => (
    <DropdownItem key={value} id={value} isDisabled={isDisabled}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const currentValue = event?.currentTarget.innerText
        ? event?.currentTarget.innerText
        : current;
      setCurrent(currentValue ? currentValue : '');
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [current, setValue],
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
