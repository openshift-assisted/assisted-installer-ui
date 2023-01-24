import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  FormGroup,
  DropdownSeparator,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { DiscoveryImageType, getFieldId } from '../../../common';

export const discoveryImageTypes: Record<DiscoveryImageType, string> = {
  'minimal-iso': 'Minimal image file - Provision with virtual media',
  'full-iso': 'Full image file - Provision with physical media',
  'discovery-image-ipxe': 'iPXE - Provision from your network server',
};

type DiscoveryImageTypeDropdownProps = {
  name: string;
  defaultValue: string | undefined;
  onChange: (isIpxeSelected: boolean) => void;
};

export const DiscoveryImageTypeDropdown = ({
  name,
  defaultValue,
  onChange,
}: DiscoveryImageTypeDropdownProps) => {
  const [field, { value }, { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const fieldId = getFieldId(name, 'input');
  const dropdownItems = [
    <DropdownItem
      key="minimal-iso"
      id="minimal-iso"
      description={
        'Use when your storage capacity is limited or being served over a constrained network.'
      }
    >
      {discoveryImageTypes['minimal-iso']}
    </DropdownItem>,
    <DropdownSeparator key="separator1" />,
    <DropdownItem
      key="full-iso"
      id="full-iso"
      description={'The generated discovery ISO will contain everything needed to boot.'}
    >
      {discoveryImageTypes['full-iso']}
    </DropdownItem>,
    <DropdownSeparator key="separator2" />,
    <DropdownItem
      key="discovery-image-ipxe"
      id="discovery-image-ipxe"
      description={'Use when you have an iPXE server that has already been set up.'}
    >
      {discoveryImageTypes['discovery-image-ipxe']}
    </DropdownItem>,
  ];

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const imageTypeSelection = event?.currentTarget.id as DiscoveryImageType;
      const currentValue = imageTypeSelection
        ? discoveryImageTypes[imageTypeSelection]
        : defaultValue;
      setCurrent(currentValue ? currentValue : '');
      setValue(imageTypeSelection);
      setOpen(false);
      onChange(imageTypeSelection === 'discovery-image-ipxe');
    },
    [setCurrent, setOpen, defaultValue, setValue, onChange],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {current || value}
      </DropdownToggle>
    ),
    [setOpen, current, value],
  );

  return (
    <FormGroup fieldId={fieldId} label={'Provisioning type'}>
      <Dropdown
        {...field}
        name={name}
        id={fieldId}
        dropdownItems={dropdownItems}
        toggle={toggle}
        isOpen={isOpen}
        className="pf-u-w-100"
        onSelect={onSelect}
      />
    </FormGroup>
  );
};
export default DiscoveryImageTypeDropdown;
