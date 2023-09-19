import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import {
  ArchitectureSupportLevelId,
  Cluster,
  CpuArchitecture,
  getDefaultCpuArchitecture,
  getFieldId,
  SupportedCpuArchitecture,
} from '../../../common';

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

const isCpuArchitectureSupported = (
  cpuArchitectures: SupportedCpuArchitecture[],
  cpuArchitecture: SupportedCpuArchitecture,
): boolean => {
  const cpuArchFound = cpuArchitectures.find((cpuArch) => cpuArch === cpuArchitecture);
  return cpuArchFound !== undefined;
};

type CpuArchitectureDropdownProps = {
  openshiftVersion: Cluster['openshiftVersion'];
  day1CpuArchitecture?: SupportedCpuArchitecture;
  cpuArchitectures: SupportedCpuArchitecture[];
  onChange?: (value: string) => void;
};

const CpuArchitectureDropdown = ({
  openshiftVersion,
  day1CpuArchitecture,
  cpuArchitectures,
  onChange,
}: CpuArchitectureDropdownProps) => {
  const [field, { value: selectedCpuArchitecture }, { setValue }] =
    useField<SupportedCpuArchitecture>(INPUT_NAME);

  const [isOpen, setOpen] = React.useState(false);

  const prevVersionRef = React.useRef(openshiftVersion);
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
      onChange && onChange(selectedCpuArch);
    },
    [setOpen, setValue, onChange],
  );

  React.useEffect(() => {
    const isSelectedCpuArchitectureSupported = isCpuArchitectureSupported(
      cpuArchitectures,
      selectedCpuArchitecture,
    );
    if (
      !isSelectedCpuArchitectureSupported &&
      selectedCpuArchitecture !== getDefaultCpuArchitecture()
    ) {
      setCurrentCpuArch(architectureData[getDefaultCpuArchitecture()].label);
      setOpen(false);
    }
    if (prevVersionRef.current !== openshiftVersion) {
      prevVersionRef.current = openshiftVersion;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openshiftVersion, selectedCpuArchitecture]);

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
