import React, { MouseEvent } from 'react';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import { FeatureId, getFieldId } from '../../../../common';
import {
  ExternalPlaformIds,
  ExternalPlatformLabels,
  ExternalPlatformLinks,
  ExternalPlatformTooltips,
} from './constants';
import { PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import {
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');

type ExternalPlatformDropdownProps = {
  showOciOption: boolean;
  onChange: (selectedPlatform: PlatformType) => void;
  cpuArchitecture?: string;
  clusterExists?: boolean;
  clusterPlatform?: PlatformType;
  featureSupportLevelData?: NewFeatureSupportLevelMap | null;
};

export type ExternalPlatformInfo = {
  label: string;
  href?: string;
  tooltip?: string;
  featureId: string;
};

const getExternalPlatformTypes = (
  showOciOption: boolean,
): Partial<{ [key in PlatformType]: ExternalPlatformInfo }> => {
  const platforms = ['none', 'nutanix', showOciOption && 'oci', 'vsphere'] as PlatformType[];

  return platforms.filter(Boolean).reduce(
    (a, platform) => ({
      ...a,
      [platform]: {
        label: ExternalPlatformLabels[platform],
        href: ExternalPlatformLinks[platform],
        tooltip: ExternalPlatformTooltips[platform],
        featureId: ExternalPlaformIds[platform],
      },
    }),
    {},
  );
};

export const areAllExternalPlatformIntegrationDisabled = (
  externalPlatformTypes: Partial<{ [key in PlatformType]: ExternalPlatformInfo }>,
  newFeatureSupportLevelContext: NewFeatureSupportLevelData,
  featureSupportLevelData?: NewFeatureSupportLevelMap | null,
  cpuArchitecture?: string,
): boolean => {
  // Check if isDisabled is true for all options
  return Object.values(externalPlatformTypes)
    .filter((info) => info.featureId !== '')
    .every(
      (info) =>
        newFeatureSupportLevelContext.getFeatureDisabledReason(
          info.featureId as FeatureId,
          featureSupportLevelData ?? undefined,
          cpuArchitecture,
        ) !== undefined,
    );
};

export const ExternalPlatformDropdown = ({
  showOciOption,
  onChange,
  cpuArchitecture,
  clusterPlatform,
  featureSupportLevelData,
}: ExternalPlatformDropdownProps) => {
  const [field, , { setValue }] = useField<string>(INPUT_NAME);
  const [isOpen, setOpen] = React.useState(false);
  const defaultValue = React.useMemo(() => {
    if (clusterPlatform !== undefined) {
      const platform = clusterPlatform === 'baremetal' ? 'none' : clusterPlatform;
      return platform;
    } else {
      return 'none';
    }
  }, [clusterPlatform]);
  const [current, setCurrent] = React.useState<string>(defaultValue);
  const tooltipDropdownDisabled = `Platform integration is not supported when ${
    cpuArchitecture || ''
  } is selected`;

  const handleClick = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.stopPropagation(); // Stop event propagation here
    window.open(href, '_blank');
  };
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();
  const externalPlatformTypes = getExternalPlatformTypes(showOciOption);

  const dropdownIsDisabled = React.useMemo(() => {
    return areAllExternalPlatformIntegrationDisabled(
      externalPlatformTypes,
      newFeatureSupportLevelContext,
      featureSupportLevelData,
      cpuArchitecture,
    );
  }, [
    externalPlatformTypes,
    newFeatureSupportLevelContext,
    featureSupportLevelData,
    cpuArchitecture,
  ]);

  React.useEffect(() => {
    let isCurrentValueDisabled = false;

    if (current !== 'none') {
      isCurrentValueDisabled =
        newFeatureSupportLevelContext.getFeatureDisabledReason(
          ExternalPlaformIds[current as PlatformType] as FeatureId,
          featureSupportLevelData ?? undefined,
          cpuArchitecture,
        ) !== undefined;
    }
    if (dropdownIsDisabled || isCurrentValueDisabled) {
      setCurrent('none');
      setValue('none');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dropdownIsDisabled,
    current,
    newFeatureSupportLevelContext,
    featureSupportLevelData,
    cpuArchitecture,
  ]);

  const enabledItems = Object.keys(externalPlatformTypes).map((platform) => {
    const { label, href, tooltip, featureId } = externalPlatformTypes[
      platform as PlatformType
    ] as ExternalPlatformInfo;
    const disabledReason = newFeatureSupportLevelContext.getFeatureDisabledReason(
      featureId as FeatureId,
      featureSupportLevelData ?? undefined,
      cpuArchitecture,
    );

    return (
      <DropdownItem key={platform} id={platform} isAriaDisabled={disabledReason !== undefined}>
        <Split>
          <SplitItem>
            <Tooltip
              hidden={disabledReason === undefined}
              content={disabledReason !== undefined ? disabledReason : tooltip}
              position="top"
            >
              <div>{label}</div>
            </Tooltip>
          </SplitItem>
          {!!href && (
            <>
              <SplitItem isFilled />
              <SplitItem>
                <Button
                  variant={ButtonVariant.link}
                  isInline
                  style={{ float: 'right' }}
                  onClick={(event) => handleClick(event, href)}
                >
                  Learn more <i className="fas fa-external-link-alt" />
                </Button>
              </SplitItem>
            </>
          )}
        </Split>
      </DropdownItem>
    );
  });

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedPlatform = event?.currentTarget.id as PlatformType;
      setValue(selectedPlatform);
      setCurrent(selectedPlatform);
      setOpen(false);
      onChange(selectedPlatform);
    },
    [setOpen, setValue, onChange],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
        isDisabled={dropdownIsDisabled}
      >
        {externalPlatformTypes[current as PlatformType]?.label}
      </DropdownToggle>
    ),
    [externalPlatformTypes, current, dropdownIsDisabled],
  );

  return (
    <FormGroup
      id={`form-control__${fieldId}`}
      fieldId={fieldId}
      label={'Integrate with external partner platforms'}
    >
      <Tooltip
        content={tooltipDropdownDisabled}
        hidden={!dropdownIsDisabled}
        position="top"
        distance={7}
      >
        <Dropdown
          {...field}
          id={fieldId}
          dropdownItems={enabledItems}
          toggle={toggle}
          isOpen={isOpen}
          className="pf-u-w-100"
          onSelect={onSelect}
          disabled={dropdownIsDisabled}
        />
      </Tooltip>
    </FormGroup>
  );
};
