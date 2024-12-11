import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup, Tooltip } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getFieldId, StaticField } from '../..';
import { useField } from 'formik';

interface ControlPlaneNodesOption {
  value: string;
  label: string;
}

const isDropdownItemEnabled = (controlPlaneNodeCount: string, isNutanix?: boolean): boolean => {
  return (controlPlaneNodeCount === '1' && !isNutanix) || controlPlaneNodeCount !== '1';
};

const ControlPlaneNodesDropdown = ({
  isDisabled = false,
  isNutanix,
}: {
  isDisabled?: boolean;
  isNutanix?: boolean;
}) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<string | ''>('controlPlaneAgents');
  const [current, setCurrent] = React.useState<string>('3');

  const options: ControlPlaneNodesOption[] = [
    { value: '1', label: t('ai:1 (Single Node OpenShift - not highly available cluster)') },
    { value: '3', label: t('ai:3 (highly available cluster)') },
    { value: '4', label: t('ai:4 (highly available cluster+)') },
    { value: '5', label: t('ai:5 (highly available cluster++)') },
  ];

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = isDropdownItemEnabled(value, isNutanix);
    const disabledReason = t('ai:This option is not available for Nutanix platform');
    return (
      <DropdownItem
        key={value}
        id={value}
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
    setValue(val);
    setCurrent(val);
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
