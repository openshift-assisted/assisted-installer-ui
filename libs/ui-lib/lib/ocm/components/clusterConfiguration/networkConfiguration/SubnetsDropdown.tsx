import React from 'react';
import { Dropdown, DropdownItem, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
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
  const [currentDisplayValue, setCurrentDisplayValue] = React.useState<string | undefined>();
  const fieldId = getFieldId(name, 'input');

  const itemsSubnets = React.useMemo(() => {
    return machineSubnets.length === 0
      ? [noSubnetAvailableOption]
      : [makeNoSubnetSelectedOption(machineSubnets.length)].concat(
          toFormSelectOptions(machineSubnets),
        );
  }, [machineSubnets]);

  React.useEffect(() => {
    if (field.value) {
      // If the field already has a value then it must have been assigned from one of the entries in the `itemsSubnets`
      const subnetItem = itemsSubnets.find((item) => item.value === field.value);
      setCurrentDisplayValue(subnetItem?.label ?? itemsSubnets[0].label);
    } else {
      // When `itemsSubnets.length === 2`, there is a placeholder at index 0 and only one subnet at index 1.
      // In all the other cases the user should see the placeholder saying that either there is no subnet available
      // or there is more than one option they can choose from.
      const defaultValue =
        itemsSubnets.length === 2 ? itemsSubnets[1].label : itemsSubnets[0].label;
      setCurrentDisplayValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dropdownItems = itemsSubnets.map(({ value, label, isDisabled }) => (
    <DropdownItem key={value} id={value} isDisabled={isDisabled} value={value}>
      {label}
    </DropdownItem>
  ));

  const onSelect = (
    event?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ): void => {
    setCurrentDisplayValue(value as string);
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
      style={{ minWidth: '420px' }}
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
