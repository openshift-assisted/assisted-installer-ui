import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  HelperText,
  FormGroup,
  DropdownSeparator,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import { useField } from 'formik';
import { getFieldId } from '../../../common';

const discoveryImageTypes = {
  'discovery-iso-minimal': 'Minimal image file - Provision with virtual media',
  'discovery-iso-full': 'Full image file - Provision with physicial media',
  'discovery-iso-ipxe': 'iPXE - Provision from your network server',
};

type DiscoveryImageTypeDropdownProps = {
  name: string;
  defaultValue: string | undefined;
};

export const DiscoveryImageTypeDropdown = ({
  name,
  defaultValue,
}: DiscoveryImageTypeDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const fieldId = getFieldId(name, 'input');
  const dropdownItems = [
    <DropdownItem
      key="discovery-iso-minimal"
      id="discovery-iso-minimal"
      onClick={() => {}}
      description={
        'Use when your storage capacity is limited or being served over a constrained network.'
      }
    >
      {discoveryImageTypes['discovery-iso-minimal']}
    </DropdownItem>,
    <DropdownSeparator />,
    <DropdownItem
      key="discovery-iso-full"
      id="discovery-iso-full"
      onClick={() => {}}
      description={'The generated discovery ISO will contain everything needed to boot.'}
    >
      {discoveryImageTypes['discovery-iso-full']}
    </DropdownItem>,
    <DropdownSeparator />,
    <DropdownItem
      key="discovery-iso-ipxe"
      id="discovery-iso-ipxe"
      onClick={() => {}}
      description={'Use when you have an iPXE server that has already been set up.'}
    >
      {discoveryImageTypes['discovery-iso-ipxe']}
    </DropdownItem>,
  ];

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const currentValue = event?.currentTarget.id
        ? discoveryImageTypes[event?.currentTarget.id]
        : defaultValue;
      setCurrent(currentValue ? currentValue : '');
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setCurrent, setOpen, defaultValue, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {current}
      </DropdownToggle>
    ),
    [setOpen, current],
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
