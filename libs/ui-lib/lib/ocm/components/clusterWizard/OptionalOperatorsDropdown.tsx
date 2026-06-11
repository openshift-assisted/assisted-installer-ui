import * as React from 'react';
import {
  Badge,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { OperatorsValues } from '../../../common';

type OptionalOperatorsDropdownProps = {
  bundleId: string;
  optionalOperatorIds: string[];
  selectedBundles: OperatorsValues['selectedBundles'];
  setSelectedBundles: (selectedBundles: OperatorsValues['selectedBundles']) => void;
  isDisabled: boolean;
  getOperatorLabel: (operatorId: string) => string;
};

const OptionalOperatorsDropdown = ({
  bundleId,
  optionalOperatorIds,
  selectedBundles,
  setSelectedBundles,
  isDisabled,
  getOperatorLabel,
}: OptionalOperatorsDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleLabel = bundleId === 'openshift-ai' ? 'GPU operators' : 'Optional operators';
  const bundle = selectedBundles.find((bundleSelection) => bundleSelection.id === bundleId);
  const selectedOptionalOperators = bundle?.optionalOperators || [];

  const updateBundleOptionalOperators = (operatorId: string) => {
    if (bundle) {
      const isCurrentlySelected = selectedOptionalOperators.includes(operatorId);
      const nextOptionalOperators = isCurrentlySelected
        ? selectedOptionalOperators.filter((optionalOperator) => optionalOperator !== operatorId)
        : [...selectedOptionalOperators, operatorId];

      const updatedBundles = selectedBundles.map((bundleSelection) =>
        bundleSelection.id === bundleId
          ? {
              ...bundleSelection,
              optionalOperators: nextOptionalOperators,
            }
          : bundleSelection,
      );

      setSelectedBundles(updatedBundles);
    }
  };

  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent | undefined,
    value?: string | number,
  ) => {
    const operatorId = value as string | undefined;
    if (operatorId) {
      updateBundleOptionalOperators(operatorId);
    }
  };

  return (
    <Select
      role="menu"
      isOpen={isOpen}
      onSelect={onSelect}
      selected={selectedOptionalOperators}
      onOpenChange={(nextIsOpen) => setIsOpen(nextIsOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
          isExpanded={isOpen}
          isDisabled={isDisabled}
        >
          {toggleLabel}
          {selectedOptionalOperators.length > 0 && (
            <Badge isRead>{selectedOptionalOperators.length}</Badge>
          )}
        </MenuToggle>
      )}
    >
      <SelectList>
        {optionalOperatorIds.map((operatorId) => (
          <SelectOption
            id={`optional-operator-${bundleId}-${operatorId}`}
            key={operatorId}
            value={operatorId}
            hasCheckbox
            isSelected={selectedOptionalOperators.includes(operatorId)}
          >
            {getOperatorLabel(operatorId)}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default OptionalOperatorsDropdown;
