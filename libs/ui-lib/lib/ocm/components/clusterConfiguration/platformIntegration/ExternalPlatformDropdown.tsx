import React, { MouseEvent } from 'react';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { PlatformType, getFieldId } from '../../../../common';
import {
  ExternalPlatformLabels,
  ExternalPlatformLinks,
  ExternalPlatformTooltips,
} from './constants';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');

type ExternalPlatformDropdownProps = {
  showOciOption: boolean;
  disabledOciTooltipContent: React.ReactNode;
  isOciDisabled: boolean;
  onChange: (selectedPlatform: PlatformType) => void;
};

export type ExternalPlatformInfo = {
  label: string;
  href?: string;
  tooltip?: string;
};

const getExternalPlatformTypes = (
  showOciOption: boolean,
): Partial<{ [key in PlatformType]: ExternalPlatformInfo }> => {
  const platforms = ['none', 'nutanix', showOciOption && 'oci', 'vsphere'] as PlatformType[];

  return platforms.filter(Boolean).reduce(
    (a, platform) => ({
      ...a,
      [platform]: {
        label: ExternalPlatformLabels[platform],
        href: ExternalPlatformLinks[platform],
        tooltip: ExternalPlatformTooltips[platform],
      },
    }),
    {},
  );
};

export const ExternalPlatformDropdown = ({
  showOciOption,
  disabledOciTooltipContent,
  isOciDisabled,
  onChange,
}: ExternalPlatformDropdownProps) => {
  const [field, { value, initialValue }, { setValue }] = useField<string>(INPUT_NAME);
  const [isOpen, setOpen] = React.useState(false);
  const handleClick = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.stopPropagation(); // Stop event propagation here
    window.open(href, '_blank');
  };

  const externalPlatformTypes = getExternalPlatformTypes(showOciOption);

  const enabledItems = Object.keys(externalPlatformTypes).map((platform) => {
    const isOracleDisabled = platform === 'oci' && isOciDisabled;
    const { label, href, tooltip } = externalPlatformTypes[
      platform as PlatformType
    ] as ExternalPlatformInfo;

    return (
      <DropdownItem
        key={platform}
        id={platform}
        tooltip={isOracleDisabled ? disabledOciTooltipContent : tooltip}
        isAriaDisabled={isOracleDisabled}
        tooltipProps={{ position: 'top-start' }}
      >
        <Split>
          <SplitItem>{label}</SplitItem>
          {!!href && (
            <>
              <SplitItem isFilled />
              <SplitItem>
                <Button
                  variant={ButtonVariant.link}
                  isInline
                  style={{ float: 'right' }}
                  onClick={(event) => handleClick(event, href)}
                >
                  Learn more <i className="fas fa-external-link-alt" />
                </Button>
              </SplitItem>
            </>
          )}
        </Split>
      </DropdownItem>
    );
  });

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedPlatform = event?.currentTarget.id as PlatformType;
      setValue(selectedPlatform);
      setOpen(false);
      onChange(selectedPlatform);
    },
    [setOpen, setValue, onChange],
  );

  React.useEffect(() => {
    if (value === 'oci' && isOciDisabled) {
      setValue('none');
    }
  }, [initialValue, isOciDisabled, setValue, value]);

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {externalPlatformTypes[value as PlatformType]?.label}
      </DropdownToggle>
    ),
    [externalPlatformTypes, value],
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
