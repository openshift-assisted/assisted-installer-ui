import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import {
  DropdownItem,
  Divider,
  Dropdown,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
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
      value={discoveryImageTypes['full-iso']}
    >
      {discoveryImageTypes['full-iso']}
    </DropdownItem>,
    <Divider component="li" key="separator1" />,
    <Tooltip
      key="minimal-iso-tooltip"
      content={
        isMinimalISODisabled ? (
          <p>{'This provisioning type is not supported when using s390x architecture'}</p>
        ) : undefined
      }
    >
      <DropdownItem
        key="minimal-iso"
        id="minimal-iso"
        description={'Use when provisioning with default networking options'}
        isAriaDisabled={!!isMinimalISODisabled}
        value={discoveryImageTypes['minimal-iso']}
      >
        {discoveryImageTypes['minimal-iso']}
      </DropdownItem>
    </Tooltip>,
    <Divider component="li" key="separator2" />,
    <DropdownItem
      key="discovery-image-ipxe"
      id="discovery-image-ipxe"
      description={'Use when your platform does not support booting from ISO'}
      value={discoveryImageTypes['discovery-image-ipxe']}
    >
      {discoveryImageTypes['discovery-image-ipxe']}
    </DropdownItem>,
  ];

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>, value?: string | number) => {
    const imageTypeSelection = value as string;
    setCurrent(imageTypeSelection ? imageTypeSelection : '');
    setValue(event?.currentTarget.id as DiscoveryImageType);
    setOpen(false);
    onChange(imageTypeSelection === 'discovery-image-ipxe');
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={fieldId}
      className="pf-v6-u-w-100"
      ref={toggleRef}
      isFullWidth
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
    >
      {current || value}
    </MenuToggle>
  );

  return (
    <FormGroup fieldId={fieldId} label={'Provisioning type'}>
      <Dropdown
        {...field}
        id={`${fieldId}-dropdown`}
        toggle={toggle}
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={() => setOpen(!isOpen)}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </FormGroup>
  );
};
export default DiscoveryImageTypeDropdown;
