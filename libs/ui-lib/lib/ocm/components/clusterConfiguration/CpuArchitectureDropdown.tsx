import React from 'react';
import {
  FormGroup,
  Split,
  SplitItem,
  Tooltip,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useField } from 'formik';
import {
  architectureData,
  CpuArchitecture,
  FeatureId,
  getDefaultCpuArchitecture,
  getFieldId,
  SupportedCpuArchitecture,
} from '../../../common';
import { Cluster, PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import { ExternalPlaformIds, ExternalPlatformLabels } from './platformIntegration/constants';

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
    (event?: React.MouseEvent<Element, MouseEvent>): void => {
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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={fieldId}
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      className="pf-v6-u-w-100"
    >
      {currentCpuArch}
    </MenuToggle>
  );

  return (
    <FormGroup id={`form-control__${fieldId}`} fieldId={fieldId} label={'CPU architecture'}>
      <Dropdown
        {...field}
        id={`${fieldId}-dropdown`}
        toggle={toggle}
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={() => setOpen(!isOpen)}
      >
        {enabledItems}
      </Dropdown>
    </FormGroup>
  );
};
export default CpuArchitectureDropdown;
