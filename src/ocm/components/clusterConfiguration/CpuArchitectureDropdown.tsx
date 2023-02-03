import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';
import { useField, useFormikContext } from 'formik';
import {
  ClusterCreateParams,
  CpuArchitecture,
  FeatureId,
  FeatureSupportLevelData,
  getDefaultCpuArchitecture,
  getFieldId,
  getSupportedCpuArchitectures,
  SupportedCpuArchitecture,
  useFeatureSupportLevel,
} from '../../../common';

type CpuArchitectureItem = {
  description: string;
  featureSupportLevelId?: FeatureId;
};

const architectureData: Record<SupportedCpuArchitecture, CpuArchitectureItem> = {
  [CpuArchitecture.x86]: {
    description: 'The default CPU architecture',
  },
  [CpuArchitecture.ARM]: {
    description:
      'Check this option if you want to use the arm64 CPU architecture. Please note that some features will not be available',
    featureSupportLevelId: 'ARM64_ARCHITECTURE',
  },
};

const INPUT_NAME = 'cpuArchitecture';
const fieldId = getFieldId(INPUT_NAME, 'input');

const getInvalidCombinationReason = (
  featureSupportLevels: FeatureSupportLevelData,
  cpuArchitecture: SupportedCpuArchitecture,
  openshiftVersion: string,
) => {
  const { featureSupportLevelId } = architectureData[cpuArchitecture];
  return featureSupportLevels && featureSupportLevelId
    ? featureSupportLevels.getFeatureDisabledReason(openshiftVersion, featureSupportLevelId)
    : undefined;
};

const CpuArchitectureDropdown = () => {
  const [field, { value: selectedCpuArchitecture }, { setValue }] =
    useField<SupportedCpuArchitecture>(INPUT_NAME);
  const {
    values: { openshiftVersion },
  } = useFormikContext<ClusterCreateParams>();
  const [isOpen, setOpen] = React.useState(false);

  const prevVersionRef = React.useRef(openshiftVersion);
  const featureSupportLevels = useFeatureSupportLevel();

  const enabledItems = React.useMemo(() => {
    return getSupportedCpuArchitectures().map((cpuArch) => {
      const disabledReason = getInvalidCombinationReason(
        featureSupportLevels,
        cpuArch,
        openshiftVersion,
      );
      return (
        <DropdownItem
          key={cpuArch}
          id={cpuArch}
          description={architectureData[cpuArch].description}
          tooltip={disabledReason ? <p>{disabledReason}</p> : undefined}
          isAriaDisabled={!!disabledReason}
        >
          {cpuArch}
        </DropdownItem>
      );
    });
  }, [featureSupportLevels, openshiftVersion]);

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      const selectedCpuArch = event?.currentTarget.id as SupportedCpuArchitecture;
      setValue(selectedCpuArch);
      setOpen(false);
    },
    [setOpen, setValue],
  );

  React.useEffect(() => {
    if (prevVersionRef.current !== openshiftVersion) {
      const invalidCombinationReason = getInvalidCombinationReason(
        featureSupportLevels,
        selectedCpuArchitecture,
        openshiftVersion,
      );
      if (invalidCombinationReason) {
        setValue(getDefaultCpuArchitecture());
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
        {selectedCpuArchitecture}
      </DropdownToggle>
    ),
    [setOpen, selectedCpuArchitecture],
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
