import React, { MouseEvent } from 'react';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
} from '@patternfly/react-core';
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
  dropdownIsDisabled: boolean;
};

export type ExternalPlatformInfo = {
  label: string;
  href: string;
  tooltip: string;
};

export const externalPlatformTypes: Record<ExternalPlatformType, ExternalPlatformInfo> = {
  none: {
    label: 'No platform integration',
    href: '',
    tooltip: '',
  },
  nutanix: {
    label: 'Nutanix',
    href: NUTANIX_CONFIG_LINK,
    tooltip: '',
  },
  oci: {
    label: 'Oracle  (Requires a custom manifest)',
    href: '',
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
  dropdownIsDisabled,
}: ExternalPlatformDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(INPUT_NAME);
  const [currentPlatform, setCurrentPlatform] = React.useState(
    externalPlatformTypes[selectedPlatform].label,
  );
  const [isOpen, setOpen] = React.useState(false);
  const handleClick = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.stopPropagation(); // Stop event propagation here
    window.open(href, '_blank');
  };
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
        <DropdownItem
          key={platformType}
          id={platformType}
          tooltip={isOracleDisabled ? disabledOciTooltipContent : tooltip}
          isAriaDisabled={isOracleDisabled}
          tooltipProps={{ position: 'top-start' }}
        >
          {label}
          {!isHrefEmpty && (
            <Button
              variant={ButtonVariant.link}
              style={{ float: 'right' }}
              onClick={(event) => handleClick(event, href)}
            >
              Learn more <i className="fas fa-external-link-alt" />
            </Button>
          )}
        </DropdownItem>
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
        isDisabled={dropdownIsDisabled}
      >
        {currentPlatform || value}
      </DropdownToggle>
    ),
    [dropdownIsDisabled, currentPlatform, value],
  );

  return (
    <FormGroup
      id={`form-control__${fieldId}`}
      fieldId={fieldId}
      label={'Integrate with external partner platforms'}
    >
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
