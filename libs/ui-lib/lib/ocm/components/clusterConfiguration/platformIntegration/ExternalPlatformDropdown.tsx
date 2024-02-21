import React, { MouseEvent } from 'react';
import {
  Button,
  ButtonVariant,
  FormGroup,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { useField } from 'formik';
import {
  CpuArchitecture,
  FeatureId,
  SupportedCpuArchitecture,
  getFieldId,
} from '../../../../common';
import { ExternalPlaformIds, ExternalPlatformLabels, ExternalPlatformLinks } from './constants';
import { PlatformType, SupportLevel } from '@openshift-assisted/types/assisted-installer-service';
import {
  NewFeatureSupportLevelData,
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import { architectureData } from '../CpuArchitectureDropdown';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const INPUT_NAME = 'platform';
const fieldId = getFieldId(INPUT_NAME, 'input');

type ExternalPlatformDropdownProps = {
  showOciOption: boolean;
  onChange: (selectedPlatform: PlatformType) => void;
  cpuArchitecture?: SupportedCpuArchitecture;
  featureSupportLevelData: NewFeatureSupportLevelMap | null;
  isSNO: boolean;
};

export type ExternalPlatformInfo = {
  label: string;
  href?: string;
  disabledReason?: string;
  supportLevel?: SupportLevel;
};

const getDisabledReasonForExternalPlatform = (
  isSNO: boolean,
  newFeatureSupportLevelContext: NewFeatureSupportLevelData,
  platform: PlatformType,
  featureSupportLevelData?: NewFeatureSupportLevelMap | null,
  cpuArchitecture?: SupportedCpuArchitecture,
): string | undefined => {
  if (isSNO && (platform === 'nutanix' || platform === 'vsphere')) {
    return `${ExternalPlatformLabels[platform]} integration is not supported for Single-Node OpenShift.`;
  } else if (
    isSNO &&
    (cpuArchitecture === CpuArchitecture.ppc64le || cpuArchitecture === CpuArchitecture.s390x)
  ) {
    return `Plaform integration is not supported for Single-Node OpenShift with the selected CPU architecture.`;
  } else {
    return newFeatureSupportLevelContext.getFeatureDisabledReason(
      ExternalPlaformIds[platform] as FeatureId,
      featureSupportLevelData ?? undefined,
      cpuArchitecture,
    );
  }
};

const getExternalPlatformTypes = (
  showOciOption: boolean,
  isSNO: boolean,
  newFeatureSupportLevelContext: NewFeatureSupportLevelData,
  featureSupportLevelData?: NewFeatureSupportLevelMap | null,
  cpuArchitecture?: SupportedCpuArchitecture,
): Partial<{ [key in PlatformType]: ExternalPlatformInfo }> => {
  const platforms = ['none', 'nutanix', showOciOption && 'external', 'vsphere'] as PlatformType[];

  return platforms.filter(Boolean).reduce(
    (a, platform) => ({
      ...a,
      [platform]: {
        label: ExternalPlatformLabels[platform],
        href: ExternalPlatformLinks[platform],
        disabledReason: getDisabledReasonForExternalPlatform(
          isSNO,
          newFeatureSupportLevelContext,
          platform,
          featureSupportLevelData ?? undefined,
          cpuArchitecture,
        ),
        supportLevel: newFeatureSupportLevelContext.getFeatureSupportLevel(
          ExternalPlaformIds[platform] as FeatureId,
          featureSupportLevelData ?? undefined,
        ),
      },
    }),
    {},
  );
};

export const areAllExternalPlatformIntegrationDisabled = (
  externalPlatformTypes: Partial<{ [key in PlatformType]: ExternalPlatformInfo }>,
): boolean => {
  return Object.values(externalPlatformTypes)
    .filter((info) => info.label !== 'No platform integration')
    .every((info) => info.disabledReason !== undefined);
};

const getReasonForDropdownDisabled = (isSNO: boolean, labelCpuArch: string): string => {
  if (!isSNO) {
    return `Platform integration is not supported when ${labelCpuArch} is selected`;
  } else {
    return `Platform integration is not supported for SNO clusters`;
  }
};

export const ExternalPlatformDropdown = ({
  showOciOption,
  onChange,
  cpuArchitecture,
  featureSupportLevelData,
  isSNO,
}: ExternalPlatformDropdownProps) => {
  const [field, , { setValue }] = useField<string>(INPUT_NAME);
  const [isOpen, setOpen] = React.useState(false);
  const [externalPlatformTypes, setExternalPlatformTypes] = React.useState<
    Partial<{ [key in PlatformType]: ExternalPlatformInfo }>
  >({});

  const tooltipDropdownDisabled = getReasonForDropdownDisabled(
    isSNO,
    cpuArchitecture ? architectureData[cpuArchitecture].label : '',
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.stopPropagation(); // Stop event propagation here
    window.open(href, '_blank');
  };
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();
  React.useEffect(() => {
    // Calculate updated externalPlatformTypes based on the dependencies
    const updatedExternalPlatformTypes = getExternalPlatformTypes(
      showOciOption,
      isSNO,
      newFeatureSupportLevelContext,
      featureSupportLevelData,
      cpuArchitecture,
    );

    // Update the state with the new externalPlatformTypes
    setExternalPlatformTypes(updatedExternalPlatformTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureSupportLevelData, cpuArchitecture, isSNO]);

  const dropdownIsDisabled = React.useMemo(() => {
    return areAllExternalPlatformIntegrationDisabled(externalPlatformTypes);
  }, [externalPlatformTypes]);

  React.useEffect(() => {
    let isCurrentValueDisabled = false;

    if (field.value !== 'none') {
      isCurrentValueDisabled =
        externalPlatformTypes[field.value as PlatformType]?.disabledReason !== undefined;
    }
    if (dropdownIsDisabled || isCurrentValueDisabled) {
      setValue('none');
      onChange('none');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownIsDisabled, externalPlatformTypes]);

  const enabledItems = Object.keys(externalPlatformTypes).map((platform) => {
    const { label, href, disabledReason, supportLevel } = externalPlatformTypes[
      platform as PlatformType
    ] as ExternalPlatformInfo;

    return (
      <DropdownItem key={platform} id={platform} isAriaDisabled={disabledReason !== undefined}>
        <Split>
          <SplitItem>
            <Tooltip hidden={!disabledReason} content={disabledReason} position="top">
              <div>
                {label}
                <span onClick={(event) => event.stopPropagation()}>
                  <NewFeatureSupportLevelBadge
                    featureId={ExternalPlaformIds[platform as PlatformType] as FeatureId}
                    supportLevel={supportLevel}
                  />
                </span>
              </div>
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
      setOpen(false);
      onChange(selectedPlatform);
    },
    [setOpen, setValue, onChange],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(_event, val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-v5-u-w-100"
        isDisabled={dropdownIsDisabled}
      >
        {externalPlatformTypes[field.value as PlatformType]?.label}
      </DropdownToggle>
    ),
    [externalPlatformTypes, field, dropdownIsDisabled],
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
          className="pf-v5-u-w-100"
          onSelect={onSelect}
          disabled={dropdownIsDisabled}
        />
      </Tooltip>
    </FormGroup>
  );
};
