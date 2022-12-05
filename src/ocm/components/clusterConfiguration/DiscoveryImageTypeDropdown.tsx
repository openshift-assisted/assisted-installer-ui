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
import { getFieldId } from '../../../common';

const discoveryImageTypes = {
  'discovery-iso-minimal': 'Minimal image file - Provision with virtual media',
  'discovery-iso-full': 'Full image file - Provision with physicial media',
  'discovery-image-ipxe': 'iPXE - Provision from your network server',
};

type DiscoveryImageTypeDropdownProps = {
  name: string;
  defaultValue: string | undefined;
  updateAlertAndButtonText: (imageType: string) => void;
};

export const DiscoveryImageTypeDropdown = ({
  name,
  defaultValue,
  updateAlertAndButtonText,
}: DiscoveryImageTypeDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const fieldId = getFieldId(name, 'input');
  const dropdownItems = [
    <DropdownItem
      key="discovery-iso-minimal"
      id="discovery-iso-minimal"
      description={
        'Use when your storage capacity is limited or being served over a constrained network.'
      }
    >
      {discoveryImageTypes['discovery-iso-minimal']}
    </DropdownItem>,
    <DropdownSeparator key="separator1" />,
    <DropdownItem
      key="discovery-iso-full"
      id="discovery-iso-full"
      description={'The generated discovery ISO will contain everything needed to boot.'}
    >
      {discoveryImageTypes['discovery-iso-full']}
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
      const currentValue = event?.currentTarget.id
        ? discoveryImageTypes[event?.currentTarget.id]
        : defaultValue;
      setCurrent(currentValue ? currentValue : '');
      setValue(event?.currentTarget.id);
      setOpen(false);
      updateAlertAndButtonText(event?.currentTarget.id || '');
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
