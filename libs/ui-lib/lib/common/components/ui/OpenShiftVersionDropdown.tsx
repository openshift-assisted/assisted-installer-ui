import React from 'react';
import { HelperText, FormGroup, FormHelperText, HelperTextItem } from '@patternfly/react-core';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  DropdownSeparator,
} from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';

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
  items: {
    label: string;
    value: string;
  }[];
  versions: OpenshiftVersionOptionType[];
  getHelperText: HelperTextType;
  showReleasesLink: boolean;
};

export const OpenShiftVersionDropdown = ({
  name,
  items,
  versions,
  getHelperText,
  showReleasesLink,
}: OpenShiftVersionDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const fieldId = getFieldId(name, 'input');
  const isDisabled = versions.length === 0;

  const { defaultLabel, defaultValue } = React.useMemo(() => {
    const defaultVersion = versions.find((item) => item.default);
    return {
      defaultLabel: defaultVersion?.label || '',
      defaultValue: defaultVersion?.value || '',
    };
  }, [versions]);

  const [helperText, setHelperText] = React.useState(getHelperText(versions, defaultValue, t));
  const [current, setCurrent] = React.useState<string>(defaultLabel);

  const versionsY = Array.from(new Set(items.map((val) => val.value.match(/^\d+\.(\d+)/)?.[1])));
  const lastVersion = versionsY.slice(-1)[0];

  const parsedVersions = versionsY.map((y) => ({
    y: y,
    versions: items.filter((val) => val.value.match(/^\d+\.(\d+)/)?.[1] === y),
  }));

  const dropdownItems = parsedVersions.map(({ y, versions }) => {
    const items = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value}>
        {label}
      </DropdownItem>
    ));

    if (y !== lastVersion) {
      items.push(<DropdownSeparator key={`separator-${y || ''}`} />);
    }

    return items;
  });

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const newLabel = event?.currentTarget.innerText;
      const newValue = event?.currentTarget.id;
      if (newLabel && newValue) {
        setCurrent(newLabel);
        setValue(newValue);
        setHelperText(getHelperText(versions, newValue, t));
        setOpen(false);
      }
    },
    [setCurrent, setHelperText, setOpen, getHelperText, t, versions, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(_event, val) => setOpen(!isDisabled && val)}
        toggleIndicator={CaretDownIcon}
        isDisabled={isDisabled}
        isText
        className="pf-v5-u-w-100"
      >
        {current}
      </DropdownToggle>
    ),
    [setOpen, current, isDisabled],
  );

  return (
    <FormGroup
      id={`form-control__${fieldId}`}
      fieldId={fieldId}
      label={t('ai:OpenShift version')}
      isRequired
    >
      <Dropdown
        {...field}
        name={name}
        id={fieldId}
        onSelect={onSelect}
        dropdownItems={dropdownItems}
        toggle={toggle}
        isOpen={isOpen}
        className="pf-v5-u-w-100"
      />
      {helperText && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="default">{helperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      {showReleasesLink && (
        <ExternalLink href={`${window.location.origin}/${OCP_RELEASES_PAGE}`}>
          <span data-ouia-id="openshift-releases-link">
            {t('ai:Learn more about OpenShift releases')}
          </span>
        </ExternalLink>
      )}
    </FormGroup>
  );
};
