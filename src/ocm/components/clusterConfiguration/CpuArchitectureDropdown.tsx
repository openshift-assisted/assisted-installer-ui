import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import {
  Cluster,
  CpuArchitecture,
  FeatureId,
  getDefaultCpuArchitecture,
  getFieldId,
  SupportedCpuArchitecture,
} from '../../../common';
import {
  NewFeatureSupportLevelData,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';

export type CpuArchitectureItem = {
  description: string;
  featureSupportLevelId?: FeatureId;
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
    label: 'PowerPC 64-bit LE',
  },
  [CpuArchitecture.s390x]: {
    description: 'Some features may not be available',
    featureSupportLevelId: 'S390X_ARCHITECTURE',
    label: 'System/390 64-bit',
  },
};

const INPUT_NAME = 'cpuArchitecture';
const fieldId = getFieldId(INPUT_NAME, 'input');

const getInvalidCombinationReason = (
  featureSupportLevels: NewFeatureSupportLevelData,
  cpuArchitecture: SupportedCpuArchitecture,
) => {
  const { featureSupportLevelId } = architectureData[cpuArchitecture];
  return featureSupportLevels && featureSupportLevelId
    ? featureSupportLevels.getFeatureDisabledReason(featureSupportLevelId)
    : undefined;
};

type CpuArchitectureDropdownProps = {
  openshiftVersion: Cluster['openshiftVersion'];
  day1CpuArchitecture?: SupportedCpuArchitecture;
  cpuArchitectures: SupportedCpuArchitecture[];
};

const CpuArchitectureDropdown = ({
  openshiftVersion,
  day1CpuArchitecture,
  cpuArchitectures,
}: CpuArchitectureDropdownProps) => {
  const [field, { value: selectedCpuArchitecture }, { setValue }] =
    useField<SupportedCpuArchitecture>(INPUT_NAME);

  const [isOpen, setOpen] = React.useState(false);

  const prevVersionRef = React.useRef(openshiftVersion);
  const featureSupportLevels = useNewFeatureSupportLevel();
  const [currentCpuArch, setCurrentCpuArch] = React.useState<string>(
    day1CpuArchitecture ? architectureData[day1CpuArchitecture].label : CpuArchitecture.x86,
  );

  const enabledItems = React.useMemo(() => {
    if (cpuArchitectures !== undefined) {
      return cpuArchitectures.map((cpuArch) => {
        return (
          <DropdownItem
            key={cpuArch}
            id={cpuArch}
            description={cpuArch ? architectureData[cpuArch].description : ''}
          >
            {cpuArch ? architectureData[cpuArch].label : ''}
          </DropdownItem>
        );
      });
    }
  }, [cpuArchitectures]);

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedCpuArch = event?.currentTarget.id as SupportedCpuArchitecture;
      setValue(selectedCpuArch);
      setOpen(false);
      setCurrentCpuArch(architectureData[selectedCpuArch].label);
    },
    [setOpen, setValue],
  );

  React.useEffect(() => {
    if (prevVersionRef.current !== openshiftVersion) {
      const invalidCombinationReason = getInvalidCombinationReason(
        featureSupportLevels,
        selectedCpuArchitecture,
      );
      if (invalidCombinationReason) {
        setValue(getDefaultCpuArchitecture());
        setCurrentCpuArch(architectureData[getDefaultCpuArchitecture()].label);
        setOpen(false);
      }
    }
    prevVersionRef.current = openshiftVersion;
  }, [featureSupportLevels, openshiftVersion, selectedCpuArchitecture, setValue, setOpen]);

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
    <FormGroup fieldId={fieldId} label={'CPU architecture'}>
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
