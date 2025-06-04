import React from 'react';
import {
  HelperText,
  FormGroup,
  FormHelperText,
  HelperTextItem,
  Button,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownGroup,
  Divider,
} from '@patternfly/react-core';

import { OpenshiftVersionOptionType } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { useField, useFormikContext } from 'formik';
import { getFieldId } from './formik';
import ExternalLink from './ExternalLink';
import { OCP_RELEASES_PAGE } from '../../config';
import { ClusterDetailsValues, ItemDropdown } from '../clusterWizard';

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

  const parsedVersionsForCustomItems = getParsedVersions(customItems);
  let lastCustomY: string | undefined = '';
  const customDropdownItems = parsedVersionsForCustomItems.parsedVersions.map(({ y, versions }) => {
    const customItems = versions.map(({ value, label }) => (
      <DropdownItem key={value} id={value} value={value}>
        {label}
      </DropdownItem>
    ));
    if (lastCustomY !== null && y !== lastCustomY) {
      customItems.push(<Divider key={`separator-${y || ''}`} />);
    }
    lastCustomY = y;
    return customItems;
  });

  const dropdownGroup = [
    dropdownItems.length && (
      <DropdownGroup label="Latest releases" key="latest-releases">
        {dropdownItems}
      </DropdownGroup>
    ),
    <DropdownGroup label="Custom releases" key="custom-releases">
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
    (event?: React.MouseEvent<Element, MouseEvent>, val?: string | number) => {
      const newLabel = event?.currentTarget.textContent;
      const newValue = (val as string) || '';
      if (newLabel && newValue !== 'all-versions') {
        setCurrent(newLabel);
        setValue(newValue);
        setOpen(false);
      }
    },
    [setValue],
  );

  const dropdownToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={fieldId}
      className="pf-v6-u-w-100"
      ref={toggleRef}
      isFullWidth
      onClick={() => setOpen(!isOpen)}
      isDisabled={isDisabled}
      isExpanded={isOpen}
    >
      {current}
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
