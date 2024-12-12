import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup, Tooltip } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getFieldId, StaticField } from '../..';
import { useField } from 'formik';
import toNumber from 'lodash-es/toNumber';
import { TFunction } from 'react-i18next';

interface ControlPlaneNodesOption {
  value: number;
  label: string;
}

const isDropdownItemEnabled = (
  controlPlaneNodeCount: number,
  isNutanix?: boolean,
  openshiftVersion?: string,
  cpuArch?: string,
): boolean => {
  if (controlPlaneNodeCount === 4 || controlPlaneNodeCount === 5) {
    return parseFloat(openshiftVersion || '') >= 4.18 && cpuArch === 'x86_64';
  } else if (controlPlaneNodeCount === 1) {
    return !isNutanix;
  }
  return true;
};

const getDisabledReason = (
  controlPlaneNodeCount: number,
  t: TFunction<string, undefined>,
): string => {
  if (controlPlaneNodeCount === 4 || controlPlaneNodeCount === 5) {
    return t(
      'ai:This option is not available with the current configurations. Make sure that OpenShift version is 4.18 or newer and CPU architecture is x86_64. ',
    );
  } else if (controlPlaneNodeCount === 1) {
    return t('ai:This option is not available for Nutanix platform');
  } else {
    return '';
  }
};

interface ControlPlaneNodesDropdownProps {
  isDisabled?: boolean;
  isNutanix?: boolean;
  cpuArchitecture?: string;
  openshiftVersion?: string;
}

const ControlPlaneNodesDropdown = ({
  isDisabled = false,
  isNutanix,
  cpuArchitecture,
  openshiftVersion,
}: ControlPlaneNodesDropdownProps) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<number>('controlPlaneAgents');
  const [current, setCurrent] = React.useState<number>(3);

  const options: ControlPlaneNodesOption[] = [
    { value: 1, label: t('ai:1 (Single Node OpenShift - not highly available cluster)') },
    { value: 3, label: t('ai:3 (highly available cluster)') },
    { value: 4, label: t('ai:4 (highly available cluster+)') },
    { value: 5, label: t('ai:5 (highly available cluster++)') },
  ];

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = isDropdownItemEnabled(
      value,
      isNutanix,
      openshiftVersion,
      cpuArchitecture,
    );
    const disabledReason = getDisabledReason(value, t);
    return (
      <DropdownItem
        key={value}
        id={value.toString()}
        isAriaDisabled={!isItemEnabled}
        selected={current === value}
      >
        <Tooltip hidden={isItemEnabled} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const [controlPlanelOpen, setControlPlanelOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const onControlPlaneSelect = (e?: React.SyntheticEvent<HTMLDivElement>) => {
    const val = e?.currentTarget.id as string;
    setValue(toNumber(val));
    setCurrent(toNumber(val));
    setControlPlanelOpen(false);
  };

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:Number of control plane nodes')} isRequired>
      <Dropdown
        toggle={
          <DropdownToggle
            onToggle={() => setControlPlanelOpen(!controlPlanelOpen)}
            className="pf-u-w-100"
          >
            {value ? value : '3'}
          </DropdownToggle>
        }
        name="controlPlaneAgents"
        isOpen={controlPlanelOpen}
        onSelect={onControlPlaneSelect}
        dropdownItems={dropdownItems}
        className="pf-u-w-100"
      />
    </FormGroup>
  ) : (
    <StaticField
      name={'controlPlaneAgents'}
      label={t('ai:Number of control plane nodes')}
      isRequired
    >
      {value}
    </StaticField>
  );
};

export default ControlPlaneNodesDropdown;
