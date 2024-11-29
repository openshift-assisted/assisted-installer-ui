import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
import { useField } from 'formik';
import { PopoverIcon } from '../../../common';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import OcmSNODisclaimer from './OcmSNODisclaimer';

const INPUT_NAME = 'controlPlaneCount';
const fieldId = `form-control__${INPUT_NAME}`;
const DEFAULT_VALUE = '3';

export const ControlPlaneNodesLabel = () => {
  return (
    <>
      Number of control plane nodes <PopoverIcon bodyContent={<>Info control plane nodes</>} />
    </>
  );
};

interface ControlPlaneNodesOption {
  value: string;
  label: string;
}

interface ControlPlaneNodesDropdownProps {
  openshiftVersion: string;
  cpuArch: string;
  platform: string;
  featureSupportLevelData?: NewFeatureSupportLevelMap;
}

const isDropdownEnabled = (
  openshiftVersion: string,
  cpuArch: string,
  platform: string,
): boolean => {
  return (
    parseFloat(openshiftVersion) >= 4.18 &&
    cpuArch === 'x86_64' &&
    (platform === 'none' || platform === 'baremetal')
  );
};

const ControlPlaneNodesDropdown: React.FC<ControlPlaneNodesDropdownProps> = ({
  openshiftVersion,
  cpuArch,
  platform,
  featureSupportLevelData,
}) => {
  const [field, , { setValue }] = useField<string>(INPUT_NAME);
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();

  const snoSupportLevel = newFeatureSupportLevelContext.getFeatureSupportLevel(
    'SNO',
    featureSupportLevelData,
  );
  const snoExpansion = newFeatureSupportLevelContext.isFeatureSupported(
    'SINGLE_NODE_EXPANSION',
    featureSupportLevelData,
  );
  const isDisabled = newFeatureSupportLevelContext.isFeatureDisabled(
    'SNO',
    featureSupportLevelData,
  );

  const options: ControlPlaneNodesOption[] = [
    { value: '1', label: '1 (Single Node OpenShift - not highly available cluster)' },
    { value: '3', label: '3 (highly available cluster)' },
    { value: '4', label: '4 (highly available cluster+)' },
    { value: '5', label: '5 (highly available cluster++)' },
  ];

  const isControlPlanesNodesOptionAvailable = isDropdownEnabled(
    openshiftVersion,
    cpuArch,
    platform,
  );

  React.useEffect(() => {
    if (!field.value) {
      setValue(DEFAULT_VALUE);
    }
  }, [field.value, setValue]);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
    const selectedValue = event?.currentTarget.id as string;
    setValue(selectedValue);
    setOpen(false);
  };

  const dropdownItems = options.map(({ value, label }) => (
    <DropdownItem key={value} id={value} isAriaDisabled={!isControlPlanesNodesOptionAvailable}>
      <div>{label}</div>
    </DropdownItem>
  ));

  const toggle = (
    <DropdownToggle
      onToggle={(_, val) => setOpen(val)}
      isDisabled={!isControlPlanesNodesOptionAvailable}
    >
      {options.find((opt) => opt.value === field.value)?.label || 'Select'}
    </DropdownToggle>
  );

  return (
    <>
      <FormGroup label={<ControlPlaneNodesLabel />} fieldId={fieldId}>
        <Tooltip
          content="This option is not available with the current configurations. Make sure that OpenShift version is 4.18 or newer, CPU architecture is x86_64 and no external platform integration is selected."
          hidden={isControlPlanesNodesOptionAvailable}
        >
          <Dropdown
            id={fieldId}
            isOpen={isOpen}
            toggle={toggle}
            dropdownItems={dropdownItems}
            onSelect={onSelect}
          />
        </Tooltip>
      </FormGroup>
      {field.value === '1' && (
        <OcmSNODisclaimer
          isDisabled={isDisabled}
          snoSupportLevel={snoSupportLevel || 'supported'}
          snoExpansionSupported={snoExpansion}
        />
      )}
    </>
  );
};

export default ControlPlaneNodesDropdown;
