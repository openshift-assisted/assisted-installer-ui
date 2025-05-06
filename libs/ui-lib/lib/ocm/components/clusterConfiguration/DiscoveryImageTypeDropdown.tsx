import React from 'react';
import { FormGroup, Divider } from '@patternfly/react-core';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';
import { useField } from 'formik';
import {
  CpuArchitecture,
  DiscoveryImageType,
  SupportedCpuArchitecture,
  getFieldId,
} from '../../../common';
import { Tooltip } from '@patternfly/react-core';

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
      value="full-iso"
      description="Use when configuring custom networking for easier debugging"
    >
      {discoveryImageTypes['full-iso']}
    </DropdownItem>,
    <Divider key="separator1" />,
    <DropdownItem
      key="minimal-iso"
      value="minimal-iso"
      id="minimal-iso"
      description="Use when provisioning with default networking options"
      isAriaDisabled={isMinimalISODisabled}
      tooltipProps={
        isMinimalISODisabled
          ? { content: 'This provisioning type is not supported when using s390x architecture' }
          : undefined
      }
    >
      {discoveryImageTypes['minimal-iso']}
    </DropdownItem>,
    <Divider key="separator2" />,
    <DropdownItem
      key="discovery-image-ipxe"
      value="discovery-image-ipxe"
      description="Use when your platform does not support booting from ISO"
    >
      {discoveryImageTypes['discovery-image-ipxe']}
    </DropdownItem>,
  ];

  const onSelect = (
    event: React.MouseEvent | React.KeyboardEvent | undefined,
    value: string | number | undefined,
  ) => {
    const imageTypeSelection = (value as DiscoveryImageType) || defaultValue;
    const currentValue = imageTypeSelection
      ? discoveryImageTypes[imageTypeSelection]
      : defaultValue;
    setCurrent(currentValue || '');
    setValue(imageTypeSelection);
    setOpen(false);
    onChange(imageTypeSelection === 'discovery-image-ipxe');
  };

  const toggle = React.useMemo(
    () => (toggleRef: React.RefObject<any>) =>
      (
        <MenuToggle
          onClick={() => setOpen(!isOpen)}
          isDisabled={isDisabled}
          ref={toggleRef}
          className="pf-v5-u-w-100"
          isExpanded={isOpen}
        >
          {current || value || defaultValue || 'Select a provisioning type'}
        </MenuToggle>
      ),
    [current, value, defaultValue, isDisabled, isOpen],
  );

  return (
    <FormGroup fieldId={fieldId} label="Provisioning type">
      <Dropdown onSelect={onSelect} toggle={toggle} isOpen={isOpen} className="pf-v5-u-w-100">
        {dropdownItems}
      </Dropdown>
    </FormGroup>
  );
};

export default DiscoveryImageTypeDropdown;
