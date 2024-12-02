import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  DropdownProps,
} from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { HostRole } from '../../../common/types/hosts';
import './SimpleDropdown.css';

type SimpleDropdownProps = {
  current?: string;
  defaultValue: string;
  items: HostRole[];
  setValue: (value?: string) => void;
  isDisabled: boolean;
  idPrefix?: string;
  menuAppendTo?: DropdownProps['menuAppendTo'];
};

export const SimpleDropdown = ({
  current,
  defaultValue,
  items,
  setValue,
  isDisabled,
  idPrefix,
  menuAppendTo,
}: SimpleDropdownProps) => {
  const [isOpen, setOpen] = React.useState(false);
  const dropdownItems = items.map(({ value, label, description }) => (
    <DropdownItem key={value} id={value} description={description}>
      {label}
    </DropdownItem>
  ));

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      setValue(event?.currentTarget.id);
      setOpen(false);
    },
    [setValue, setOpen],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(_event, val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        id={idPrefix ? `${idPrefix}-dropdown-toggle-items` : undefined}
        className="role-dropdown"
      >
        {current || defaultValue}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled, defaultValue, idPrefix],
  );

  return (
    <Dropdown
      onSelect={onSelect}
      dropdownItems={dropdownItems}
      toggle={toggle}
      isOpen={isOpen}
      isPlain
      id={idPrefix ? `${idPrefix}-dropdown-toggle` : undefined}
      menuAppendTo={menuAppendTo}
    />
  );
};
