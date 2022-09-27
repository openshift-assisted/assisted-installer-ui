import React from 'react';
import { DropdownItem, DropdownToggle, Dropdown, HelperText } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

import { OpenshiftVersionOptionType } from '../../types';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type HelperTextType = (
  versions: OpenshiftVersionOptionType[],
  value: string | undefined,
  t: TFunction,
) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  defaultValue: string | undefined;
  items: {
    label: string;
    value: string;
  }[];
  isDisabled: boolean;
  versions: OpenshiftVersionOptionType[];
  getHelperText: HelperTextType;
};

export const OpenShiftVersionDropdown = ({
  defaultValue,
  items,
  isDisabled,
  versions,
  getHelperText,
}: OpenShiftVersionDropdownProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const { t } = useTranslation();
  const [helperText, setHelperText] = React.useState(getHelperText(versions, current, t));

  const dropdownItems = items.map(({ value, label }) => (
    <DropdownItem key={value} id={value}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const currentValue = event?.currentTarget.innerText
        ? event?.currentTarget.innerText
        : defaultValue;
      setCurrent(currentValue);
      setHelperText(getHelperText(versions, currentValue, t));
      setOpen(false);
    },
    [setCurrent, setHelperText, setOpen],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        isText
      >
        {current}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled],
  );

  return (
    <>
      <Dropdown onSelect={onSelect} dropdownItems={dropdownItems} toggle={toggle} isOpen={isOpen} />
      <HelperText style={{ display: 'inherit' }}>{helperText}</HelperText>
    </>
  );
};
