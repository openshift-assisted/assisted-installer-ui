import React from 'react';
import {
  FormGroup,
  Tooltip,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
import { useField } from 'formik';
import { getFieldId, PopoverIcon } from '../../../common';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../common/components/newFeatureSupportLevels';
import OcmTNADisclaimer from './OcmTNADisclaimer';
import toNumber from 'lodash-es/toNumber';
import OcmSNODisclaimer from './OcmSNODisclaimer';

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
  isTnaEnabled: boolean,
): boolean => {
  if (controlPlaneNodeCount === 4 || controlPlaneNodeCount === 5) {
    return isNonStandardControlPlaneEnabled;
  }
  if (controlPlaneNodeCount === 2) {
    return isTnaEnabled;
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

  const isTnaEnabled = newFeatureSupportLevelContext.isFeatureSupported(
    'TNA',
    featureSupportLevelData ?? undefined,
  );

  React.useEffect(() => {
    if (!field.value) {
      setValue(DEFAULT_VALUE);
    }
  }, [field.value, setValue]);

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>): void => {
    const selectedValue = event?.currentTarget.id as string;
    setValue(toNumber(selectedValue));
    setOpen(false);
  };

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = isDropdownItemEnabled(
      value,
      isNonStandardControlPlaneEnabled,
      isTnaEnabled,
    );
    return (
      <DropdownItem key={value} id={value.toString()} isAriaDisabled={!isItemEnabled}>
        <Tooltip hidden={isItemEnabled} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      id={fieldId}
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      className="pf-v5-u-w-100"
    >
      {options.find((opt) => opt.value === field.value)?.label || 'Select'}
    </MenuToggle>
  );

  return (
    <>
      <FormGroup
        id={`form-control__${fieldId}`}
        label={<ControlPlaneNodesLabel />}
        fieldId={fieldId}
      >
        <Dropdown
          id={`${fieldId}-dropdown`}
          isOpen={isOpen}
          toggle={toggle}
          onOpenChange={() => setOpen(!isOpen)}
          onSelect={onSelect}
        >
          <DropdownList>{dropdownItems}</DropdownList>
        </Dropdown>
      </FormGroup>
      {field.value === 1 && (
        <OcmSNODisclaimer
          isDisabled={isDisabled}
          snoSupportLevel={snoSupportLevel || 'supported'}
          snoExpansionSupported={snoExpansion}
        />
      )}
      {field.value === 2 && <OcmTNADisclaimer />}
    </>
  );
};

export default ControlPlaneNodesDropdown;
