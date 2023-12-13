import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
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
    <DropdownItem key={value} id={value} isDisabled={isDisabled}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const currentValue = event?.currentTarget.innerText ?? currentDisplayValue;
      setCurrentDisplayValue(currentValue);
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [currentDisplayValue, setValue],
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
        {currentDisplayValue}
      </DropdownToggle>
    ),
    [setOpen, currentDisplayValue, isDisabled],
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
