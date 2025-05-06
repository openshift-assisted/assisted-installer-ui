import * as React from 'react';
import { FormGroup, Select, SelectList, SelectOption, Tooltip } from '@patternfly/react-core';
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
  const [isOpen, setIsOpen] = React.useState(false);
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

  const onSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value !== undefined) {
      setValue(toNumber(value));
      setIsOpen(false);
    }
  };

  const selectOptions = options.map(({ value, label }) => {
    const isItemEnabled = [1, 3].includes(value) || allowHighlyAvailable;
    const disabledReason = t('ai:This option is not available with the selected OpenShift version');
    return (
      <SelectOption
        key={value}
        id={value.toString()}
        value={value}
        isDisabled={!isItemEnabled}
        isSelected={selectedValue === value}
      >
        <Tooltip hidden={isItemEnabled} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </SelectOption>
    );
  });

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:Number of control plane nodes')} isRequired>
      <Select
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        selected={selectedValue}
        toggle={(toggleRef) => (
          <button
            ref={toggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="pf-v6-c-select__toggle-button pf-u-w-100"
          >
            {selectedValue || '3'}
          </button>
        )}
        className="pf-u-w-100"
      >
        <SelectList>{selectOptions}</SelectList>
      </Select>
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
