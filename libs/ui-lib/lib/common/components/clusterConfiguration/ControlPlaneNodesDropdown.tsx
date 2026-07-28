import * as React from 'react';
import {
  FormGroup,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getFieldId, StaticField } from '../..';
import toNumber from 'lodash-es/toNumber';
import OcmTNADisclaimer from './OcmTNADisclaimer';
import { ClusterDetailsValues } from '../clusterWizard';
import { useField, useFormikContext } from 'formik';

const isItemEnabled = (value: number, allowHighlyAvailable?: boolean, allowTNA?: boolean) => {
  switch (value) {
    case 1:
    case 3:
      return true;
    case 2:
      return !!allowTNA;
    case 4:
    case 5:
      return !!allowHighlyAvailable;
  }
  return false;
};

interface ControlPlaneNodesOption {
  value: number;
  label: string;
}

const ControlPlaneNodesDropdown = ({
  isDisabled = false,
  allowHighlyAvailable,
  allowTNA,
}: {
  isDisabled?: boolean;
  allowHighlyAvailable?: boolean;
  allowTNA?: boolean;
}) => {
  const { t } = useTranslation();
  const [{ name, value: selectedValue }, , { setValue }] = useField<number>('controlPlaneCount');
  const { setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const [controlPlanelOpen, setControlPlanelOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const options: ControlPlaneNodesOption[] = [
    { value: 1, label: t('ai:1 (Single Node OpenShift - not highly available cluster)') },
    { value: 2, label: t('ai:2 (Two-Nodes Arbiter)') },
    { value: 3, label: t('ai:3 (highly available cluster)') },
    { value: 4, label: t('ai:4 (highly available cluster+)') },
    { value: 5, label: t('ai:5 (highly available cluster++)') },
  ];

  React.useEffect(() => {
    if (!allowHighlyAvailable && [4, 5].includes(selectedValue)) {
      setValue(3);
    }
  }, [allowHighlyAvailable, selectedValue, setValue]);

  const disabledReason = t('ai:This option is not available with the selected OpenShift version');
  const dropdownItems = options.map(({ value, label }) => {
    const isEnabled = isItemEnabled(value, allowHighlyAvailable, allowTNA);

    return (
      <DropdownItem
        key={value}
        id={value.toString()}
        isAriaDisabled={!isEnabled}
        disabled={!isEnabled}
        selected={selectedValue === value}
        value={value}
        tooltipProps={{ hidden: isEnabled, content: disabledReason, position: 'top' }}
      >
        {label}
      </DropdownItem>
    );
  });

  const onControlPlaneSelect = (
    e?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    if (value === 1) {
      setFieldValue('userManagedNetworking', true);
      setFieldValue('platform', 'none');
    } else {
      setFieldValue('userManagedNetworking', false);
      setFieldValue('platform', 'baremetal');
    }
    setValue(toNumber(value));
    setControlPlanelOpen(false);
  };

  return (
    <>
      {!isDisabled ? (
        <FormGroup
          isInline
          fieldId={fieldId}
          label={t('ai:Number of control plane nodes')}
          isRequired
        >
          <Dropdown
            isOpen={controlPlanelOpen}
            onSelect={onControlPlaneSelect}
            onOpenChange={() => setControlPlanelOpen(!controlPlanelOpen)}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                className="pf-v5-u-w-100"
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
      )}

      {selectedValue === 2 && <OcmTNADisclaimer />}
    </>
  );
};

export default ControlPlaneNodesDropdown;
