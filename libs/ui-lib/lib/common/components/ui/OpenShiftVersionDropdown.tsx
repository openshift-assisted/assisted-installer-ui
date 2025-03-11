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
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField, useFormikContext } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';
import { ClusterDetailsValues, ItemDropdown } from '../clusterWizard';
import './OpenShiftVersionDropdown.css';

export type HelperTextType = (value: string | undefined, inModal?: boolean) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  name: string;
  items: ItemDropdown;
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
  showReleasesLink: boolean;
  showOpenshiftVersionModal: () => void;
  customItems: ItemDropdown;
};

const getParsedVersions = (items: ItemDropdown) => {
  const versionsY = Array.from(new Set(items.map((val) => val.value.match(/^\d+\.(\d+)/)?.[1])));

  const parsedVersions = versionsY.map((y) => ({
    y: y,
    versions: items.filter((val) => val.value.match(/^\d+\.(\d+)/)?.[1] === y),
  }));
  return { parsedVersions: parsedVersions.reverse() };
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
  const [field, , { setValue }] = useField<string>(name);
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const fieldId = getFieldId(name, 'input');
  const isDisabled = versions.length === 0;
  const {
    values: { customOpenshiftSelect },
  } = useFormikContext<ClusterDetailsValues>();
  const [current, setCurrent] = React.useState<string>();

  React.useEffect(() => {
    const defaultVersion = customOpenshiftSelect
      ? customOpenshiftSelect
      : versions.find((item) => item.default);
    setCurrent(defaultVersion?.label || '');
    setValue(defaultVersion?.value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customOpenshiftSelect]);

  const parsedVersionsForItems = getParsedVersions(items);
  let lastY: string | undefined = '';
  const dropdownItems = parsedVersionsForItems.parsedVersions.map(({ y, versions }) => {
    const items = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value}>
        {label}
      </DropdownItem>
    ));

    if (lastY !== null && y !== lastY) {
      items.push(<DropdownSeparator key={`separator-${y || ''}`} />);
    }
    lastY = y;
    return items;
  });

  const parsedVersionsForCustomItems = getParsedVersions(customItems);
  let lastCustomY: string | undefined = '';
  const customDropdownItems = parsedVersionsForCustomItems.parsedVersions.map(({ y, versions }) => {
    const customItems = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value}>
        {label}
      </DropdownItem>
    ));

    if (lastCustomY !== null && y !== lastCustomY) {
      customItems.push(<DropdownSeparator key={`separator-${y || ''}`} />);
    }
    lastCustomY = y;

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
      const newValue = event?.currentTarget.id || '';
      if (newLabel && newValue !== 'all-versions') {
        setCurrent(newLabel);
        setValue(newValue);
        setOpen(false);
      }
    },
    [setValue],
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

  const helperText = getHelperText && getHelperText(field.value);

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
