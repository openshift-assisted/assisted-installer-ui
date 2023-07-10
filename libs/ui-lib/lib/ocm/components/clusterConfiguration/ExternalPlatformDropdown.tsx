import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { PlatformType, getFieldId } from '../../../common';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');

type ExternalPlatformDropdownProps = {
  isOciEnabled: boolean;
  selectedPlatform?: PlatformType;
};

export const externalPlatformTypes: Record<PlatformType, string> = {
  none: 'None',
  baremetal: 'Baremetal',
  nutanix: 'Nutanix',
  oci: 'Oracle',
  vsphere: 'vSphere',
};

const ExternalPlatformDropdown = ({
  isOciEnabled,
  selectedPlatform,
}: ExternalPlatformDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(INPUT_NAME);
  const [current, setCurrent] = React.useState(
    selectedPlatform ? externalPlatformTypes[selectedPlatform] : 'None',
  );
  const [isOpen, setOpen] = React.useState(false);

  const enabledItems = [
    <DropdownItem key="none" id="none">
      {externalPlatformTypes['none']}
    </DropdownItem>,
    <DropdownItem key="nutanix-platform" id="nutanix">
      {externalPlatformTypes['nutanix']}
    </DropdownItem>,
    <DropdownItem key="oracle-platform" id="oci" disabled={!isOciEnabled}>
      {externalPlatformTypes['oci']}
    </DropdownItem>,
    <DropdownItem key="vsphere-platform" id="vsphere">
      {externalPlatformTypes['vsphere']}
    </DropdownItem>,
  ];

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedPlatform = event?.currentTarget.id as PlatformType;
      setValue(selectedPlatform);
      setOpen(false);
      setCurrent(externalPlatformTypes[selectedPlatform]);
    },
    [setOpen, setValue],
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
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId} label={'Integrate with platform'}>
      <Dropdown
        {...field}
        id={fieldId}
        dropdownItems={enabledItems}
        toggle={toggle}
        isOpen={isOpen}
        className="pf-u-w-100"
        onSelect={onSelect}
      />
    </FormGroup>
  );
};
export default ExternalPlatformDropdown;
