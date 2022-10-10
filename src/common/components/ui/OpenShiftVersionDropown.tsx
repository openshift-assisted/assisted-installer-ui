import React from 'react';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  HelperText,
  FormGroup,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

import { OpenshiftVersionOptionType } from '../../types';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';

export type HelperTextType = (
  versions: OpenshiftVersionOptionType[],
  value: string | undefined,
  t: TFunction,
) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  name: string;
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
  name,
  defaultValue,
  items,
  isDisabled,
  versions,
  getHelperText,
}: OpenShiftVersionDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(defaultValue);
  const { t } = useTranslation();
  const [helperText, setHelperText] = React.useState(getHelperText(versions, defaultValue, t));
  const fieldId = getFieldId(name, 'input');
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
      setCurrent(currentValue ? currentValue : '');
      setValue(event?.currentTarget.id);
      setHelperText(getHelperText(versions, currentValue, t));
      setOpen(false);
    },
    [setCurrent, setHelperText, setOpen, defaultValue, getHelperText, t, versions, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        isText
        className="pf-u-w-100"
      >
        {current}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled],
  );

  return (
    <FormGroup fieldId={fieldId} label={t('ai:OpenShift version')} isRequired>
      <Flex direction={{ default: 'column', lg: 'row' }}>
        <FlexItem flex={{ default: 'flex_1' }}>
          <Dropdown
            {...field}
            name={name}
            id={fieldId}
            onSelect={onSelect}
            dropdownItems={dropdownItems}
            toggle={toggle}
            isOpen={isOpen}
            className="pf-u-w-100"
          />
          <HelperText style={{ display: 'inherit' }}>{helperText}</HelperText>
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <ExternalLink href={OCP_RELEASES_PAGE}>
            {t('ai:Learn more about OpenShift releases')}
          </ExternalLink>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};
