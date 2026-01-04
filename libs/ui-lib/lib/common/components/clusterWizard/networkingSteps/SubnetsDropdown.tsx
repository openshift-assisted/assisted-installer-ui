import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownGroup,
  MenuToggle,
  MenuToggleElement,
  MenuToggleProps,
  Divider,
} from '@patternfly/react-core';
import { useField } from 'formik';
import { Address4, Address6 } from 'ip-address';
import { getFieldId } from '../../ui';
import { HostSubnet } from '../../../types';
import { NO_SUBNET_SET } from '../../../config';
import { TechnologyPreview, PreviewBadgePosition } from '../../ui';

type SubnetsDropdownProps = {
  name: string;
  machineSubnets: HostSubnet[];
  isDisabled: boolean;
  onAfterSelect?: (selectedValue: string) => void;
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
  onAfterSelect,
  ...props
}: SubnetsDropdownProps & MenuToggleProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const { itemsSubnets, ipv4Subnets, ipv6Subnets, currentDisplayValue } = React.useMemo(() => {
    const itemsSubnets =
      machineSubnets.length === 0
        ? [noSubnetAvailableOption]
        : [makeNoSubnetSelectedOption(machineSubnets.length)].concat(
            toFormSelectOptions(machineSubnets),
          );

    // Separate IPv4 and IPv6 subnets
    const ipv4Subnets = machineSubnets.filter((subnet) => Address4.isValid(subnet.subnet));
    const ipv6Subnets = machineSubnets.filter((subnet) => Address6.isValid(subnet.subnet));

    let currentDisplayValue =
      itemsSubnets.length > 1 ? itemsSubnets[1].label : itemsSubnets[0].label; // The placeholder is the fallback in some cases
    if (field.value) {
      const subnetItem = itemsSubnets.find((item) => item.value === field.value);
      if (subnetItem) {
        currentDisplayValue = subnetItem.label;
      }
    } else if (machineSubnets.length === 1) {
      // When there is only one subnet, it's selected by default. We skip the placeholder at index 0.
      currentDisplayValue = itemsSubnets[1].label;
    }

    return { itemsSubnets, ipv4Subnets, ipv6Subnets, currentDisplayValue: currentDisplayValue };
  }, [machineSubnets, field.value]);

  const dropdownItems = React.useMemo(() => {
    if (machineSubnets.length === 0) {
      return [
        <DropdownItem
          key={noSubnetAvailableOption.value}
          id={noSubnetAvailableOption.value}
          isDisabled={noSubnetAvailableOption.isDisabled}
          value={noSubnetAvailableOption.value}
        >
          {noSubnetAvailableOption.label}
        </DropdownItem>,
      ];
    }

    const hasIpv4 = ipv4Subnets.length > 0;
    const hasIpv6 = ipv6Subnets.length > 0;

    // If we have both IPv4 and IPv6, group them
    if (hasIpv4 && hasIpv6) {
      const ipv4Items = toFormSelectOptions(ipv4Subnets).map(({ value, label, isDisabled }) => (
        <DropdownItem key={value} id={value} isDisabled={isDisabled} value={value}>
          {label}
        </DropdownItem>
      ));
      ipv4Items.push(<Divider key="ipv4-divider" />);
      const ipv6Items = toFormSelectOptions(ipv6Subnets).map(({ value, label, isDisabled }) => (
        <DropdownItem key={value} id={value} isDisabled={isDisabled} value={value}>
          {label}
        </DropdownItem>
      ));

      return [
        <DropdownItem
          key={makeNoSubnetSelectedOption(machineSubnets.length).value}
          id={makeNoSubnetSelectedOption(machineSubnets.length).value}
          isDisabled={makeNoSubnetSelectedOption(machineSubnets.length).isDisabled}
          value={makeNoSubnetSelectedOption(machineSubnets.length).value}
        >
          {makeNoSubnetSelectedOption(machineSubnets.length).label}
        </DropdownItem>,
        <DropdownGroup label="IPv4" key="ipv4-group">
          {ipv4Items}
        </DropdownGroup>,
        <DropdownGroup label="IPv6 (Technology Preview)" key="ipv6-group">
          {ipv6Items}
        </DropdownGroup>,
      ];
    }

    // If only one type, don't group
    return itemsSubnets.map(({ value, label, isDisabled }) => (
      <DropdownItem key={value} id={value} isDisabled={isDisabled} value={value}>
        {label}
      </DropdownItem>
    ));
  }, [machineSubnets, ipv4Subnets, ipv6Subnets, itemsSubnets]);

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>): void => {
    const nextValue = event?.currentTarget.id;
    setValue(nextValue);
    setOpen(false);
    if (onAfterSelect && nextValue) {
      onAfterSelect(nextValue);
    }
  };

  const currentItem = itemsSubnets.find((i) => i.label === currentDisplayValue);
  const isPrimaryMachineNetwork = name === 'machineNetworks.0.cidr';
  const showBadge = Boolean(
    isPrimaryMachineNetwork && currentItem && Address6.isValid(currentItem.value),
  );

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
      {showBadge && (
        <span onClick={(e) => e.stopPropagation()}>
          <TechnologyPreview position={PreviewBadgePosition.inlineRight} />
        </span>
      )}
    </MenuToggle>
  );

  return (
    <Dropdown
      {...field}
      id={`${fieldId}-dropdown`}
      onOpenChange={(isOpen: boolean) => setOpen(isOpen)}
      onSelect={onSelect}
      toggle={toggle}
      isOpen={isOpen}
    >
      {dropdownItems}
    </Dropdown>
  );
};
