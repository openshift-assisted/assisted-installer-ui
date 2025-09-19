import * as React from 'react';
import {
  FormGroup,
  Tooltip,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getFieldId, StaticField } from '../..';
import { useField } from 'formik';
import toNumber from 'lodash-es/toNumber';

interface ControlPlaneNodesOption {
  value: number;
  label: string;
}

const ControlPlaneNodesDropdown = ({
  isDisabled = false,
  allowHighlyAvailable,
}: {
  isDisabled?: boolean;
  allowHighlyAvailable?: boolean;
}) => {
  const { t } = useTranslation();
  const [{ name, value: selectedValue }, , { setValue }] = useField<number>('controlPlaneCount');
  const [controlPlanelOpen, setControlPlanelOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const options: ControlPlaneNodesOption[] = [
    { value: 1, label: t('ai:1 (Single Node OpenShift - not highly available cluster)') },
    { value: 3, label: t('ai:3 (highly available cluster)') },
    { value: 4, label: t('ai:4 (highly available cluster+)') },
    { value: 5, label: t('ai:5 (highly available cluster++)') },
  ];

  React.useEffect(() => {
    if (!allowHighlyAvailable && [4, 5].includes(selectedValue)) {
      setValue(3);
    }
  }, [allowHighlyAvailable, selectedValue, setValue]);

  const dropdownItems = options.map(({ value, label }) => {
    const isItemEnabled = [1, 3].includes(value) || allowHighlyAvailable;
    const disabledReason = t('ai:This option is not available with the selected OpenShift version');
    return (
      <DropdownItem
        key={value}
        id={value.toString()}
        isAriaDisabled={!isItemEnabled}
        isDisabled={!isItemEnabled}
        selected={selectedValue === value}
        value={value}
      >
        <Tooltip hidden={isItemEnabled} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const onControlPlaneSelect = (
    e?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    setValue(toNumber(value));
    setControlPlanelOpen(false);
  };

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:Number of control plane nodes')} isRequired>
      <Dropdown
        isOpen={controlPlanelOpen}
        onSelect={onControlPlaneSelect}
        onOpenChange={() => setControlPlanelOpen(!controlPlanelOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            className="pf-v6-u-w-100"
            ref={toggleRef}
            isFullWidth
            onClick={() => setControlPlanelOpen(!controlPlanelOpen)}
            isExpanded={controlPlanelOpen}
          >
            {selectedValue ? selectedValue : '3'}
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    </FormGroup>
  ) : (
    <StaticField
      name={'controlPlaneCount'}
      label={t('ai:Number of control plane nodes')}
      isRequired
    >
      {selectedValue}
    </StaticField>
  );
};

export default ControlPlaneNodesDropdown;
