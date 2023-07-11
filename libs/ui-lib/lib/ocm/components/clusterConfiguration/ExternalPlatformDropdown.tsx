import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import {
  NUTANIX_CONFIG_LINK,
  PlatformType,
  VSPHERE_CONFIG_LINK,
  getFieldId,
} from '../../../common';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import { clusterExistsReason as CLUSTER_EXISTS_REASON } from '../featureSupportLevels/featureStateUtils';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');

type ExternalPlatformDropdownProps = {
  isOracleCloudPlatformIntegrationEnabled: boolean;
  selectedPlatform?: PlatformType;
  disabledOciTooltipContent: React.ReactNode;
  isOciDisabled: boolean;
};

export const externalPlatformTypes: Record<PlatformType, string> = {
  none: 'None',
  baremetal: 'Baremetal',
  nutanix: 'Nutanix',
  oci: 'Oracle',
  vsphere: 'vSphere',
};

export const ExternalPlatformDropdown = ({
  isOracleCloudPlatformIntegrationEnabled,
  selectedPlatform,
  disabledOciTooltipContent,
  isOciDisabled,
}: ExternalPlatformDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(INPUT_NAME);
  const [current, setCurrent] = React.useState(
    selectedPlatform ? externalPlatformTypes[selectedPlatform] : 'None',
  );
  const [isOpen, setOpen] = React.useState(false);

  const enabledItems = [
    <DropdownItem key="none" id="none">
      {externalPlatformTypes['none']}
      <a
        href={'www.google.es'}
        target="_blank"
        rel="noopener noreferrer"
        style={{ float: 'right' }}
      >
        Learn more <i className="fas fa-external-link-alt" />
      </a>
    </DropdownItem>,
    <DropdownItem key="nutanix-platform" id="nutanix">
      {externalPlatformTypes['nutanix']}
      <a
        href={NUTANIX_CONFIG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{ float: 'right' }}
      >
        {'Learn more'} <i className="fas fa-external-link-alt" />
      </a>
    </DropdownItem>,
    <DropdownItem key="vsphere-platform" id="vsphere">
      {externalPlatformTypes['vsphere']}
      <a
        href={VSPHERE_CONFIG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{ float: 'right' }}
      >
        {'Learn more'} <i className="fas fa-external-link-alt" />
      </a>
    </DropdownItem>,
  ];

  if (isOracleCloudPlatformIntegrationEnabled) {
    enabledItems.push(
      <DropdownItem
        key="oracle-platform"
        id="oci"
        tooltip={isOciDisabled ? disabledOciTooltipContent : undefined}
        isAriaDisabled={!!isOciDisabled}
      >
        {externalPlatformTypes['oci']}
        <a
          href={VSPHERE_CONFIG_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ float: 'right' }}
        >
          {'Learn more'} <i className="fas fa-external-link-alt" />
        </a>
      </DropdownItem>,
    );
  }

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedPlatform = event?.currentTarget.id as PlatformType;
      setValue(selectedPlatform);
      setOpen(false);
      setCurrent(externalPlatformTypes[selectedPlatform]);
    },
    [setOpen, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {current || value}
      </DropdownToggle>
    ),
    [setOpen, current, value],
  );

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId} label={'Integrate with platform'}>
      <Dropdown
        {...field}
        id={fieldId}
        dropdownItems={enabledItems}
        toggle={toggle}
        isOpen={isOpen}
        className="pf-u-w-100"
        onSelect={onSelect}
      />
    </FormGroup>
  );
};

export const FEATURE_ID = 'EXTERNAL_PLATFORM_OCI';

export interface OracleDropdownItemState {
  readonly featureId: string;
  readonly isSupported: boolean;
  readonly isDisabled: boolean;
  readonly disabledReason?: string;
}

export const useOracleDropdownItemState = (
  hasExistentCluster: boolean,
  featureSupportLevelData: NewFeatureSupportLevelMap | null,
): OracleDropdownItemState | null => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  if (!featureSupportLevelData) {
    return null;
  }

  const isSupported = featureSupportLevelData
    ? featureSupportLevelContext.isFeatureSupported(FEATURE_ID, featureSupportLevelData)
    : false;
  const isDisabled = hasExistentCluster || !isSupported;
  let disabledReason: string | undefined;
  if (isDisabled) {
    if (hasExistentCluster) {
      disabledReason = CLUSTER_EXISTS_REASON;
    } else {
      disabledReason = featureSupportLevelContext.getFeatureDisabledReason(FEATURE_ID);
    }
  }

  return {
    featureId: FEATURE_ID,
    isSupported,
    isDisabled,
    disabledReason,
  };
};
