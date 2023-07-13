import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import {
  NUTANIX_CONFIG_LINK,
  PlatformType,
  VSPHERE_CONFIG_LINK,
  getFieldId,
} from '../../../common';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');
export type ExternalPlatformType = Extract<PlatformType, 'none' | 'nutanix' | 'oci' | 'vsphere'>;

type ExternalPlatformDropdownProps = {
  showOciOption: boolean;
  selectedPlatform: ExternalPlatformType;
  disabledOciTooltipContent: React.ReactNode;
  isOciDisabled: boolean;
  onChange: (selectedPlatform: ExternalPlatformType) => void;
};

export type ExternalPlatformInfo = {
  label: string;
  href: string;
  tooltip: string;
};

export const externalPlatformTypes: Record<ExternalPlatformType, ExternalPlatformInfo> = {
  none: {
    label: 'None',
    href: '',
    tooltip: '',
  },
  nutanix: {
    label: 'Nutanix',
    href: NUTANIX_CONFIG_LINK,
    tooltip: '',
  },
  oci: {
    label: 'Oracle  (Using custom manifests)',
    href: 'www.google.es',
    tooltip:
      "To integrate with an external partner (for example, Oracle Cloud), you'll need to provide a custom manifest.",
  },
  vsphere: {
    label: 'vSphere',
    href: VSPHERE_CONFIG_LINK,
    tooltip: '',
  },
};

export const ExternalPlatformDropdown = ({
  showOciOption,
  selectedPlatform,
  disabledOciTooltipContent,
  isOciDisabled,
  onChange,
}: ExternalPlatformDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(INPUT_NAME);
  const [currentPlatform, setCurrentPlatform] = React.useState(
    externalPlatformTypes[selectedPlatform].label,
  );
  const [isOpen, setOpen] = React.useState(false);
  const enabledItems = Object.keys(externalPlatformTypes)
    .filter((platformType) => {
      if (platformType === 'oci') {
        return showOciOption;
      }
      return true;
    })
    .map((platformType) => {
      const { label, href, tooltip } = externalPlatformTypes[platformType as ExternalPlatformType];
      const isOracleDisabled = platformType === 'oci' && isOciDisabled;
      const isHrefEmpty = href === '';
      return (
        <>
          <DropdownItem
            key={platformType}
            id={platformType}
            tooltip={isOracleDisabled ? disabledOciTooltipContent : tooltip}
            isAriaDisabled={isOracleDisabled}
          >
            {label}
            {!isHrefEmpty && (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ float: 'right' }}>
                Learn more <i className="fas fa-external-link-alt" />
              </a>
            )}
          </DropdownItem>
        </>
      );
    });

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedPlatform = event?.currentTarget.id as ExternalPlatformType;
      setValue(selectedPlatform);
      setOpen(false);
      setCurrentPlatform(externalPlatformTypes[selectedPlatform].label);
      onChange(selectedPlatform);
    },
    [setOpen, setValue, onChange],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {currentPlatform || value}
      </DropdownToggle>
    ),
    [setOpen, currentPlatform, value],
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
