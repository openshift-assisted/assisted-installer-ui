import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
import { useField } from 'formik';
import { getFieldId, PopoverIcon } from '../../../common';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import OcmSNODisclaimer from './OcmSNODisclaimer';
import toNumber from 'lodash-es/toNumber';

const INPUT_NAME = 'controlPlaneCount';
const fieldId = getFieldId(INPUT_NAME, 'input');
const DEFAULT_VALUE = 3;

export const ControlPlaneNodesLabel = () => {
  return (
    <>
      Number of control plane nodes{' '}
      <PopoverIcon
        bodyContent={
          <>
            Control plane nodes manage workloads, maintain cluster state, and ensure stability.
            Using more than three nodes boosts fault tolerance and availability, reducing downtime
            during failures.
          </>
        }
      />
    </>
  );
};

interface ControlPlaneNodesOption {
  value: number;
  label: string;
}

interface ControlPlaneNodesDropdownProps {
  featureSupportLevelData?: NewFeatureSupportLevelMap | null;
}

const isDropdownItemEnabled = (
  controlPlaneNodeCount: number,
  isNonStandardControlPlaneEnabled: boolean,
): boolean => {
  if (controlPlaneNodeCount === 4 || controlPlaneNodeCount === 5) {
    return isNonStandardControlPlaneEnabled;
  }
  return true;
};

const ControlPlaneNodesDropdown: React.FC<ControlPlaneNodesDropdownProps> = ({
  featureSupportLevelData,
}) => {
  const [field, , { setValue }] = useField<number>(INPUT_NAME);
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const newFeatureSupportLevelContext = useNewFeatureSupportLevel();

  const snoSupportLevel = newFeatureSupportLevelContext.getFeatureSupportLevel(
    'SNO',
    featureSupportLevelData ?? undefined,
  );
  const snoExpansion = newFeatureSupportLevelContext.isFeatureSupported(
    'SINGLE_NODE_EXPANSION',
    featureSupportLevelData ?? undefined,
  );
  const isDisabled = newFeatureSupportLevelContext.isFeatureDisabled(
    'SNO',
    featureSupportLevelData ?? undefined,
  );

  const disabledReason =
    'This option is not available with the current configurations. Make sure that OpenShift version is 4.18 or newer, CPU architecture is x86_64 and no external platform integration is selected.';

  const isNonStandardControlPlaneEnabled = newFeatureSupportLevelContext.isFeatureSupported(
    'NON_STANDARD_HA_CONTROL_PLANE',
    featureSupportLevelData ?? undefined,
  );

  const options: ControlPlaneNodesOption[] = [
    { value: 1, label: '1 (Single Node OpenShift)' },
    { value: 2, label: '2 (Two-Nodes Arbiter)' },
    { value: 3, label: '3 (highly available cluster)' },
    { value: 4, label: '4 (highly available cluster+)' },
    { value: 5, label: '5 (highly available cluster++)' },
  ];

  React.useEffect(() => {
    if (!field.value) {
      setValue(DEFAULT_VALUE);
    }
  }, [field.value, setValue]);

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
    const selectedValue = event?.currentTarget.id as string;
    setValue(toNumber(selectedValue));
    setOpen(false);
  };

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = isDropdownItemEnabled(value, isNonStandardControlPlaneEnabled);
    return (
      <DropdownItem key={value} id={value.toString()} isAriaDisabled={!isItemEnabled}>
        <Tooltip hidden={isItemEnabled} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const toggle = (
    <DropdownToggle onToggle={(_, val) => setOpen(val)}>
      {options.find((opt) => opt.value === field.value)?.label || 'Select'}
    </DropdownToggle>
  );

  return (
    <>
      <FormGroup
        id={`form-control__${fieldId}`}
        label={<ControlPlaneNodesLabel />}
        fieldId={fieldId}
      >
        <Dropdown
          id={fieldId}
          isOpen={isOpen}
          toggle={toggle}
          dropdownItems={dropdownItems}
          onSelect={onSelect}
        />
      </FormGroup>
      {field.value === 1 && (
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
