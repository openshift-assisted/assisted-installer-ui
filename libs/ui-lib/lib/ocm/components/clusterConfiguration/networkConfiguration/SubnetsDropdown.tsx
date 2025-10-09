import React from 'react';
import {
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
} from '@patternfly/react-core';
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

export const SubnetsDropdown = ({
  name,
  machineSubnets,
  isDisabled,
  ...props
}: SubnetsDropdownProps & MenuToggleProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const { itemsSubnets, currentDisplayValue } = React.useMemo(() => {
    const itemsSubnets =
      machineSubnets.length === 0
        ? [noSubnetAvailableOption]
        : [makeNoSubnetSelectedOption(machineSubnets.length)].concat(
            toFormSelectOptions(machineSubnets),
          );

    let currentDisplayValue = itemsSubnets[0].label; // The placeholder is the fallback
    if (field.value) {
      const subnetItem = itemsSubnets.find((item) => item.value === field.value);
      if (subnetItem) {
        currentDisplayValue = subnetItem.label;
      }
    } else if (machineSubnets.length === 1) {
      // When there is only one subnet, it's selected by default. We skip the placeholder at index 0.
      currentDisplayValue = itemsSubnets[1].label;
    }

    return { itemsSubnets, currentDisplayValue: currentDisplayValue };
  }, [machineSubnets, field.value]);

  const dropdownItems = itemsSubnets.map(({ value, label, isDisabled }) => (
    <DropdownItem key={value} id={value} isDisabled={isDisabled} value={value}>
      {label}
    </DropdownItem>
  ));

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>): void => {
    setValue(event?.currentTarget.id);
    setOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      id={fieldId}
      className="pf-v6-u-w-100"
      style={{ minWidth: '100%' }}
      {...props}
    >
      {currentDisplayValue}
    </MenuToggle>
  );

  return (
    <Dropdown
      {...field}
      id={`${fieldId}-dropdown`}
      onOpenChange={() => setOpen(!isOpen)}
      onSelect={onSelect}
      toggle={toggle}
      isOpen={isOpen}
    >
      {dropdownItems}
    </Dropdown>
  );
};
