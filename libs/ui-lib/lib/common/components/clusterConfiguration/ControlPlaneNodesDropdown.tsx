import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getFieldId, StaticField } from '../..';
import { useField } from 'formik';
import toNumber from 'lodash-es/toNumber';

interface ControlPlaneNodesOption {
  value: number;
  label: string;
}

const isDropdownItemEnabled = (controlPlaneNodeCount: number, isNutanix?: boolean): boolean => {
  return (controlPlaneNodeCount === 1 && !isNutanix) || controlPlaneNodeCount !== 1;
};

const ControlPlaneNodesDropdown = ({
  isDisabled = false,
  isNutanix,
}: {
  isDisabled?: boolean;
  isNutanix?: boolean;
}) => {
  const { t } = useTranslation();
  const [{ name, value: selectedValue }, , { setValue }] = useField<number | 3>(
    'controlPlaneAgents',
  );

  const options: ControlPlaneNodesOption[] = [
    { value: 1, label: t('ai:1 (Single Node OpenShift - not highly available cluster)') },
    { value: 3, label: t('ai:3 (highly available cluster)') },
    { value: 4, label: t('ai:4 (highly available cluster+)') },
    { value: 5, label: t('ai:5 (highly available cluster++)') },
  ];

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = isDropdownItemEnabled(value, isNutanix);
    const disabledReason = t('ai:This option is not available for Nutanix platform');
    return (
      <DropdownItem
        key={value}
        id={value.toString()}
        isAriaDisabled={!isItemEnabled}
        selected={selectedValue === value}
        value={value}
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
            {selectedValue ? selectedValue : '3'}
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
      {selectedValue}
    </StaticField>
  );
};

export default ControlPlaneNodesDropdown;
