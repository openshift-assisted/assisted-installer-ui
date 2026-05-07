import React from 'react';
import {
  HelperText,
  FormGroup,
  FormHelperText,
  HelperTextItem,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownGroup,
  Divider,
  DropdownProps,
} from '@patternfly/react-core';

import { OpenshiftVersionOptionType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField, useFormikContext } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';
import { ClusterDetailsValues, ItemDropdown } from '../clusterWizard';
import { getVersionLabel } from './utils';

export type HelperTextType = (value: string | null, inModal?: boolean) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  name: string;
  items: ItemDropdown;
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
  showReleasesLink: boolean;
  showOpenshiftVersionModal: () => void;
  customItem?: OpenshiftVersionOptionType;
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
  customItem,
}: OpenShiftVersionDropdownProps) => {
  const [field, , { setValue }] = useField<string>(name);
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const fieldId = getFieldId(name, 'input');
  const {
    values: { customOpenshiftSelect },
  } = useFormikContext<ClusterDetailsValues>();
  const current = React.useMemo(
    () =>
      (customItem ? [...versions, customItem] : versions).find(
        (item) => item.value === field.value,
      ),
    [customItem, field.value, versions],
  );

  React.useEffect(() => {
    let defaultVersion = versions.find((item) => item.default);
    if (customOpenshiftSelect && customItem) {
      defaultVersion = customItem;
    } else if (customOpenshiftSelect) {
      defaultVersion = versions.find((item) => item.value === customOpenshiftSelect);
    }

    setValue(defaultVersion?.value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customOpenshiftSelect]);

  const parsedVersionsForItems = getParsedVersions(items);
  let lastY: string | undefined = '';
  const dropdownItems = parsedVersionsForItems.parsedVersions.map(({ y, versions }) => {
    const items = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value} value={value}>
        {label}
      </DropdownItem>
    ));

    if (lastY !== null && y !== lastY) {
      items.push(<Divider key={`separator-${y || ''}`} />);
    }
    lastY = y;
    return items;
  });

  const dropdownGroup = [
    dropdownItems.length && (
      <DropdownGroup label="Latest releases" key="latest-releases">
        {dropdownItems}
      </DropdownGroup>
    ),
    customItem && (
      <DropdownGroup label="Custom releases" key="custom-releases">
        <DropdownItem key={customItem.value} id={customItem.value} value={customItem.value}>
          {customItem.label}
        </DropdownItem>
      </DropdownGroup>
    ),
    <DropdownGroup key="all-available-versions">
      <DropdownItem key="all-versions" id="all-versions" value="all-versions">
        <div className="pf-v6-u-text-color-link">{t('ai:Show all available versions')}</div>
      </DropdownItem>
    </DropdownGroup>,
  ].filter(Boolean);

  const onSelect: DropdownProps['onSelect'] = (_, val) => {
    if (val === 'all-versions') {
      showOpenshiftVersionModal();
    } else if (val) {
      setValue(val as string);
    }
    setOpen(false);
  };

  const dropdownToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={fieldId}
      className="pf-v6-u-w-100"
      style={{ minWidth: '420px' }}
      ref={toggleRef}
      isFullWidth
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      data-testid="openshift-version-dropdown-toggle"
    >
      {current ? getVersionLabel(current, t) : t('ai:OpenShift version')}
    </MenuToggle>
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
        id={`${fieldId}-dropdown`}
        shouldFocusToggleOnSelect
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={() => setOpen(!isOpen)}
        toggle={dropdownToggle}
      >
        {dropdownGroup}
      </Dropdown>

      {helperText && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="default" data-testid="openshift-version-dropdown-helper-text">
              {helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      {showReleasesLink && (
        <div className="pf-v6-u-mt-sm">
          <ExternalLink href={`${window.location.origin}/${OCP_RELEASES_PAGE}`}>
            <span data-ouia-id="openshift-releases-link">
              {t('ai:Learn more about OpenShift releases')}
            </span>
          </ExternalLink>
        </div>
      )}
    </FormGroup>
  );
};
