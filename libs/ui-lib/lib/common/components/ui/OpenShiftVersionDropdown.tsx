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
import { t_global_text_color_link_default } from '@patternfly/react-tokens/dist/js/t_global_text_color_link_default';

import { OpenshiftVersionOptionType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';
import { getVersionLabel } from './utils';

export type HelperTextType = (value: string | null, inModal?: boolean) => JSX.Element | null;

type OpenShiftVersionDropdownProps = {
  name: string;
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
  showReleasesLink: boolean;
  showOpenshiftVersionModal: () => void;
  customVersion?: OpenshiftVersionOptionType;
};

const getParsedVersions = (items: OpenshiftVersionOptionType[]) => {
  const versionsY = Array.from(new Set(items.map((val) => val.value.match(/^\d+\.(\d+)/)?.[1])));

  const parsedVersions = versionsY.map((y) => ({
    y: y,
    versions: items.filter((val) => val.value.match(/^\d+\.(\d+)/)?.[1] === y),
  }));
  return parsedVersions.reverse();
};
export const OpenShiftVersionDropdown = ({
  name,
  versions,
  getHelperText,
  showReleasesLink,
  showOpenshiftVersionModal,
  customVersion,
}: OpenShiftVersionDropdownProps) => {
  const [field, , { setValue }] = useField<string>(name);
  const [isOpen, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const fieldId = getFieldId(name, 'input');

  const current = (customVersion ? [...versions, customVersion] : versions).find(
    (item) => item.value === field.value,
  );

  React.useEffect(() => {
    if (!field.value) {
      const defaultVersion = versions.find((item) => item.default) || versions[0];
      if (defaultVersion) {
        setValue(defaultVersion.value);
      }
    }
  }, [field.value, versions, setValue]);

  const parsedVersions = getParsedVersions(versions);
  let lastY: string | undefined = '';
  const dropdownItems = parsedVersions.map(({ y, versions }) => {
    const items = versions.map((version) => (
      <DropdownItem key={version.value} id={version.value} value={version.value}>
        {getVersionLabel(version, t)}
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
    customVersion && (
      <DropdownGroup label="Custom releases" key="custom-releases">
        <DropdownItem
          key={customVersion.value}
          id={customVersion.value}
          value={customVersion.value}
        >
          {getVersionLabel(customVersion, t)}
        </DropdownItem>
      </DropdownGroup>
    ),
    <DropdownGroup key="all-available-versions">
      <DropdownItem key="all-versions" id="all-versions" value="all-versions">
        <div style={{ color: t_global_text_color_link_default.value }}>
          {t('ai:Show all available versions')}
        </div>
      </DropdownItem>
    </DropdownGroup>,
  ].filter(Boolean);

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

  const onSelect: DropdownProps['onSelect'] = (_, val) => {
    if (val === 'all-versions') {
      showOpenshiftVersionModal();
    } else if (val) {
      setValue(val as string);
    }
    setOpen(false);
  };

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
