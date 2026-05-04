import React from 'react';
import { useField, useFormikContext } from 'formik';
import {
  Dropdown,
  DropdownItem,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getFieldId } from '../../../../common/components/ui';
import type { NetworkConfigurationValues } from '../../../../common/types/clusters';
import {
  NETWORK_TYPE_LABELS,
  NETWORK_TYPE_SDN,
  isThirdPartyCNI,
} from '../../../../common/types/networkType';
import { useTranslation } from '../../../../common/hooks';
import { ThirdPartyCNIBanner } from '../../../../common';

export const NetworkTypeDropDown = ({ isSDNSelectable }: { isSDNSelectable: boolean }) => {
  const { t } = useTranslation();
  const [field, , { setValue }] = useField<string>('networkType');
  const [isOpen, setOpen] = React.useState(false);
  const { values } = useFormikContext<NetworkConfigurationValues>();
  const fieldId = getFieldId('networkType', 'input');

  const showThirdPartyBanner = isThirdPartyCNI(values.networkType);

  const currentDisplayValue = NETWORK_TYPE_LABELS(t)[field.value];
  const dropdownItems = Object.entries(NETWORK_TYPE_LABELS(t)).map(([value, label]) => (
    <DropdownItem
      key={value}
      id={value}
      value={value}
      isAriaDisabled={value === NETWORK_TYPE_SDN && !isSDNSelectable}
    >
      {label}
    </DropdownItem>
  ));

  const onSelect = (_event?: React.MouseEvent<Element, MouseEvent>, nextValue?: string): void => {
    if (nextValue) {
      setValue(nextValue);
    }
    setOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      id={fieldId}
      className="pf-v6-u-w-100"
      style={{ minWidth: '100%' }}
    >
      {currentDisplayValue || t('ai:Network type')}
    </MenuToggle>
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup fieldId={fieldId} label={t('ai:Network type')} id={`form-control__${fieldId}`}>
          <Dropdown
            id={`${fieldId}-dropdown`}
            onOpenChange={(open: boolean) => setOpen(open)}
            onSelect={onSelect}
            toggle={toggle}
            isOpen={isOpen}
          >
            {dropdownItems}
          </Dropdown>
        </FormGroup>
      </StackItem>
      {showThirdPartyBanner && <ThirdPartyCNIBanner />}
    </Stack>
  );
};
