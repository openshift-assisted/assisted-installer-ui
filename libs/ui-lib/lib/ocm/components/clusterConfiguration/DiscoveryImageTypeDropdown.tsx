import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  FormGroup,
  DropdownSeparator,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { useField } from 'formik';
import {
  CpuArchitecture,
  DiscoveryImageType,
  SupportedCpuArchitecture,
  getFieldId,
} from '../../../common';

export const discoveryImageTypes: Record<DiscoveryImageType, string> = {
  'minimal-iso': 'Minimal image file - Download an ISO that fetches content on boot',
  'full-iso': 'Full image file - Download a self-contained ISO',
  'discovery-image-ipxe': 'iPXE - Provision from your network server',
};

type DiscoveryImageTypeDropdownProps = {
  name: string;
  defaultValue: string | undefined;
  onChange: (isIpxeSelected: boolean) => void;
  selectedCpuArchitecture?: SupportedCpuArchitecture;
  isDisabled?: boolean;
};

export const DiscoveryImageTypeDropdown = ({
  name,
  defaultValue,
  onChange,
  selectedCpuArchitecture,
  isDisabled = false,
}: DiscoveryImageTypeDropdownProps) => {
  const [field, { value }, { setValue }] = useField<DiscoveryImageType>(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const fieldId = getFieldId(name, 'input');
  const isMinimalISODisabled =
    selectedCpuArchitecture && selectedCpuArchitecture === CpuArchitecture.s390x;
  const dropdownItems = [
    <DropdownItem
      key="full-iso"
      id="full-iso"
      description={'Use when configuring custom networking for easier debugging'}
    >
      {discoveryImageTypes['full-iso']}
    </DropdownItem>,
    <DropdownSeparator key="separator1" />,
    <DropdownItem
      key="minimal-iso"
      id="minimal-iso"
      description={'Use when provisioning with default networking options'}
      tooltip={
        isMinimalISODisabled ? (
          <p>{'This provisioning type is not supported when using s390x architecture'}</p>
        ) : undefined
      }
      isAriaDisabled={!!isMinimalISODisabled}
    >
      {discoveryImageTypes['minimal-iso']}
    </DropdownItem>,
    <DropdownSeparator key="separator2" />,
    <DropdownItem
      key="discovery-image-ipxe"
      id="discovery-image-ipxe"
      description={'Use when your platform does not support booting from ISO'}
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
        isDisabled={isDisabled}
      >
        {current || value}
      </DropdownToggle>
    ),
    [setOpen, current, value, isDisabled],
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
