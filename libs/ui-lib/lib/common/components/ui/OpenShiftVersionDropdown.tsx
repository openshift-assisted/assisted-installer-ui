import React from 'react';
import {
  HelperText,
  FormGroup,
  FormHelperText,
  HelperTextItem,
  Button,
} from '@patternfly/react-core';
import {
  DropdownItem,
  DropdownToggle,
  Dropdown,
  DropdownGroup,
  DropdownSeparator,
} from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';

import { OpenshiftVersionOptionType } from '../../types';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField, useFormikContext } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';
import { ClusterDetailsValues, ItemDropdown } from '../clusterWizard';

export type HelperTextType = (
  versions: OpenshiftVersionOptionType[],
  value: string | undefined,
  t: TFunction,
  isModal?: boolean,
) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  name: string;
  items: ItemDropdown;
  versions: OpenshiftVersionOptionType[];
  getHelperText: HelperTextType;
  showReleasesLink: boolean;
  showOpenshiftVersionModal: () => void;
  customItems: ItemDropdown;
};

const getParsedVersions = (items: ItemDropdown) => {
  const versionsY = Array.from(new Set(items.map((val) => val.value.match(/^\d+\.(\d+)/)?.[1])));
  const lastVersion = versionsY.slice(-1)[0];

  const parsedVersions = versionsY.map((y) => ({
    y: y,
    versions: items.filter((val) => val.value.match(/^\d+\.(\d+)/)?.[1] === y),
  }));
  return { parsedVersions: parsedVersions, lastVersion: lastVersion };
};
export const OpenShiftVersionDropdown = ({
  name,
  items,
  versions,
  getHelperText,
  showReleasesLink,
  showOpenshiftVersionModal,
  customItems,
}: OpenShiftVersionDropdownProps) => {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const fieldId = getFieldId(name, 'input');
  const isDisabled = versions.length === 0;
  const {
    values: { customOpenshiftSelect },
  } = useFormikContext<ClusterDetailsValues>();
  const { defaultLabel, defaultValue } = React.useMemo(() => {
    const defaultVersion = customOpenshiftSelect
      ? customOpenshiftSelect
      : versions.find((item) => item.default);
    return {
      defaultLabel: defaultVersion?.label || '',
      defaultValue: defaultVersion?.value || '',
    };
  }, [customOpenshiftSelect, versions]);

  const [helperText, setHelperText] = React.useState(getHelperText(versions, defaultValue, t));
  const [current, setCurrent] = React.useState<string>();

  React.useEffect(() => {
    setCurrent(defaultLabel);
  }, [defaultLabel]);

  const parsedVersionsForItems = getParsedVersions(items);
  const dropdownItems = parsedVersionsForItems.parsedVersions.map(({ y, versions }) => {
    const items = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value}>
        {label}
      </DropdownItem>
    ));

    if (y !== parsedVersionsForItems.lastVersion) {
      items.push(<DropdownSeparator key={`separator-${y || ''}`} />);
    }
    return items;
  });

  const parsedVersionsForCustomItems = getParsedVersions(customItems);
  const customDropdownItems = parsedVersionsForCustomItems.parsedVersions.map(({ y, versions }) => {
    const customItems = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value}>
        {label}
      </DropdownItem>
    ));

    if (y !== parsedVersionsForCustomItems.lastVersion) {
      customItems.push(<DropdownSeparator key={`separator-${y || ''}`} />);
    }
    return customItems;
  });

  const dropdownGroup = [
    <DropdownGroup label="Latest releases" key="latest-releases">
      {dropdownItems}
    </DropdownGroup>,
    <DropdownGroup
      label="Custom releases"
      key="custom-releases"
      hidden={customDropdownItems.length === 0}
    >
      {customDropdownItems}
    </DropdownGroup>,
    <DropdownGroup key="all-available-versions">
      <DropdownItem key="all-versions" id="all-versions">
        <Button
          variant="link"
          isInline
          onClick={() => showOpenshiftVersionModal()}
          id="show-all-versions"
        >
          Show all available versions
        </Button>
      </DropdownItem>
    </DropdownGroup>,
  ];

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const newLabel = event?.currentTarget.innerText;
      const newValue = event?.currentTarget.id;
      if (newLabel && newValue !== 'all-versions') {
        setCurrent(newLabel);
        setValue(newValue);
        setHelperText(getHelperText(versions, newValue, t));
        setOpen(false);
      }
    },
    [setValue, getHelperText, versions, t],
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
        dropdownItems={dropdownGroup}
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
