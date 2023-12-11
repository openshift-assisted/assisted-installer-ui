import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { useField } from 'formik';
import {
  CpuArchitecture,
  FeatureId,
  getDefaultCpuArchitecture,
  getFieldId,
  SupportedCpuArchitecture,
} from '../../../common';
import {
  ArchitectureSupportLevelId,
  Cluster,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import { ExternalPlaformIds, ExternalPlatformLabels } from './platformIntegration/constants';

export type CpuArchitectureItem = {
  description: string;
  featureSupportLevelId?: ArchitectureSupportLevelId;
  label: string;
};

export const architectureData: Record<SupportedCpuArchitecture, CpuArchitectureItem> = {
  [CpuArchitecture.x86]: {
    description: '',
    label: 'x86_64',
  },
  [CpuArchitecture.ARM]: {
    description: 'Some features may not be available',
    featureSupportLevelId: 'ARM64_ARCHITECTURE',
    label: 'Arm64',
  },
  [CpuArchitecture.ppc64le]: {
    description: 'Some features may not be available',
    featureSupportLevelId: 'PPC64LE_ARCHITECTURE',
    label: 'IBM Power (ppc64le)',
  },
  [CpuArchitecture.s390x]: {
    description: 'Some features may not be available',
    featureSupportLevelId: 'S390X_ARCHITECTURE',
    label: 'IBM Z (s390x)',
  },
};

const INPUT_NAME = 'cpuArchitecture';
const fieldId = getFieldId(INPUT_NAME, 'input');

const isCurrentDefaultCpuArchitecture = (
  cpuArchitectures: SupportedCpuArchitecture[],
  cpuArchitecture: SupportedCpuArchitecture,
  day1CpuArchitecture?: SupportedCpuArchitecture,
): boolean => {
  const cpuArchFound = cpuArchitectures.find((cpuArch) => cpuArch === cpuArchitecture);
  return (
    cpuArchFound === undefined &&
    cpuArchitecture !== getDefaultCpuArchitecture() &&
    day1CpuArchitecture !== CpuArchitecture.ARM
  );
};

type CpuArchitectureDropdownProps = {
  openshiftVersion: Cluster['openshiftVersion'];
  day1CpuArchitecture?: SupportedCpuArchitecture;
  cpuArchitectures: SupportedCpuArchitecture[];
  onChange?: (value: string) => void;
  platformType?: PlatformType;
};

const CpuArchitectureDropdown = ({
  openshiftVersion,
  day1CpuArchitecture,
  cpuArchitectures,
  onChange,
  platformType,
}: CpuArchitectureDropdownProps) => {
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();

  const [field, { value: selectedCpuArchitecture }, { setValue }] =
    useField<SupportedCpuArchitecture>(INPUT_NAME);

  const [isOpen, setOpen] = React.useState(false);

  const prevVersionRef = React.useRef(openshiftVersion);
  const [currentCpuArch, setCurrentCpuArch] = React.useState<string>(
    day1CpuArchitecture ? architectureData[day1CpuArchitecture].label : CpuArchitecture.x86,
  );

  const supportLevelDataForAllCpuArchs = useSupportLevelsAPI(
    'featureForAllCpus',
    openshiftVersion,
    undefined,
    platformType,
    cpuArchitectures,
  );

  const enabledItems = React.useMemo(() => {
    if (cpuArchitectures !== undefined) {
      return cpuArchitectures.map((cpuArch) => {
        let isCpuSupported = true;
        let disabledReason = `This cluster is using the  ${
          platformType ? ExternalPlatformLabels[platformType] : ''
        } platform which doesn't allow this CPU architecture.`;
        if (day1CpuArchitecture === CpuArchitecture.ARM) {
          isCpuSupported = cpuArch === CpuArchitecture.ARM;
          disabledReason =
            'Only hosts that have Arm64 CPU architecture can be added to this cluster.';
        } else if (supportLevelDataForAllCpuArchs) {
          const featureSupportLevelData = supportLevelDataForAllCpuArchs[
            cpuArch
          ] as NewFeatureSupportLevelMap;
          isCpuSupported = newFeatureSupportLevelContext.isFeatureSupported(
            ExternalPlaformIds[platformType ? platformType : 'baremetal'] as FeatureId,
            featureSupportLevelData ?? undefined,
          );
        }

        return (
          <DropdownItem
            key={cpuArch}
            id={cpuArch}
            description={cpuArch ? architectureData[cpuArch].description : ''}
            isAriaDisabled={!isCpuSupported}
          >
            <Split>
              <SplitItem>
                <Tooltip hidden={isCpuSupported} content={disabledReason} position="top">
                  <div>{cpuArch ? architectureData[cpuArch].label : ''}</div>
                </Tooltip>
              </SplitItem>
              <SplitItem isFilled />
            </Split>
          </DropdownItem>
        );
      });
    }
  }, [
    cpuArchitectures,
    day1CpuArchitecture,
    supportLevelDataForAllCpuArchs,
    platformType,
    newFeatureSupportLevelContext,
  ]);

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedCpuArch = event?.currentTarget.id as SupportedCpuArchitecture;
      setValue(selectedCpuArch);
      setOpen(false);
      setCurrentCpuArch(architectureData[selectedCpuArch].label);
      onChange && onChange(selectedCpuArch);
    },
    [setOpen, setValue, onChange],
  );

  React.useEffect(() => {
    const isCurrentDefaultCpuArchitectureSelected = isCurrentDefaultCpuArchitecture(
      cpuArchitectures,
      selectedCpuArchitecture,
      day1CpuArchitecture,
    );
    if (isCurrentDefaultCpuArchitectureSelected) {
      setValue(getDefaultCpuArchitecture());
      setCurrentCpuArch(architectureData[getDefaultCpuArchitecture()].label);
      setOpen(false);
    }
    if (prevVersionRef.current !== openshiftVersion) {
      prevVersionRef.current = openshiftVersion;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpuArchitectures, openshiftVersion, selectedCpuArchitecture]);

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-u-w-100"
      >
        {currentCpuArch}
      </DropdownToggle>
    ),
    [setOpen, currentCpuArch],
  );

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId} label={'CPU architecture'}>
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
export default CpuArchitectureDropdown;
