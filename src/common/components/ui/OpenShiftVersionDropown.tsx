import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  DropdownProps,
  HelperText,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

import { OpenshiftVersionOptionType } from '../../types';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type HelperTextType = (
  versions: OpenshiftVersionOptionType[],
  value: string,
  t: TFunction,
) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  defaultValue: string;
  items: {
    label: string;
    value: string;
  }[];
  isDisabled: boolean;
  idPrefix?: string;
  position?: DropdownProps['position'];
  versions: OpenshiftVersionOptionType[];
  getHelperText: HelperTextType;
  helperTextDefault: JSX.Element | null;
};

export const OpenShiftVersionDropdown: React.FC<OpenShiftVersionDropdownProps> = ({
  defaultValue,
  items,
  isDisabled,
  idPrefix,
  position,
  versions,
  getHelperText,
  helperTextDefault,
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const { t } = useTranslation();
  const [helperText, setHelperText] = React.useState(helperTextDefault);

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
      setHelperText(getHelperText ? getHelperText(versions, currentValue, t) : helperTextDefault);
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
        id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
        className="pf-m-text" // TODO(jtomasek): replace this with 'isText' prop once we update the PF
      >
        {current || defaultValue}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled, defaultValue, idPrefix],
  );

  return (
    <>
      <Dropdown
        onSelect={onSelect}
        dropdownItems={dropdownItems}
        toggle={toggle}
        isOpen={isOpen}
        id={idPrefix ? `${idPrefix}-dropdown-toggle` : undefined}
        position={position}
      />
      <HelperText style={{ display: 'inherit' }}>{helperText}</HelperText>
    </>
  );
};
