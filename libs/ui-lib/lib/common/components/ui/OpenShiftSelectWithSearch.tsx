import React, { Dispatch, SetStateAction } from 'react';
import {
  FormHelperText,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core';
import { OpenshiftVersionOptionType } from '../../types';
import { HelperTextType } from './OpenShiftVersionDropdown';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type OpenshiftSelectWithSearchProps = {
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
  setCustomOpenshiftSelect: Dispatch<SetStateAction<OpenshiftVersionOptionType | undefined>>;
};

export const OpenShiftSelectWithSearch: React.FunctionComponent<OpenshiftSelectWithSearchProps> = ({
  versions,
  getHelperText,
  setCustomOpenshiftSelect,
}: OpenshiftSelectWithSearchProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('');
  const { t } = useTranslation();

  const selectOptions = React.useMemo(
    () =>
      versions.map((version) => ({
        value: version.value,
        label:
          version.supportLevel === 'beta'
            ? version.label + ' - ' + t('ai:Developer preview release')
            : version.label,
        version: version,
      })),
    [versions, t],
  );

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent,
    selection: string | SelectOptionObject,
  ) => {
    const value = typeof selection === 'string' ? selection : selection.toString();
    const selectedOption = selectOptions.find((option) => option.value === value);

    if (selectedOption) {
      setSelected(value);
      setCustomOpenshiftSelect(selectedOption.version);
      setIsOpen(false);
    }
  };

  const onClear = () => {
    setSelected('');
    setCustomOpenshiftSelect(undefined);
    setIsOpen(false);
  };

  const onFilter = (e: React.ChangeEvent<HTMLInputElement> | null, value: string) => {
    if (!value || value === '') {
      return selectOptions.map((option) => (
        <SelectOption key={option.value} value={option.value}>
          {option.label}
        </SelectOption>
      ));
    }

    const filteredOptions = selectOptions.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase()),
    );

    if (filteredOptions.length === 0) {
      return [
        <SelectOption key="no-results" isDisabled>
          {t('ai:No results found for "{{value}}"', { value })}
        </SelectOption>,
      ];
    }

    return filteredOptions.map((option) => (
      <SelectOption key={option.value} value={option.value}>
        {option.label}
      </SelectOption>
    ));
  };

  const helperText = getHelperText && getHelperText(selected, true);

  return (
    <>
      <Select
        id="customOpenshiftSelect"
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel={t('ai:Select OpenShift version')}
        placeholderText={t('ai:Select an OpenShift version')}
        isOpen={isOpen}
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={onClear}
        selections={selected}
        onFilter={onFilter}
        className="pf-u-w-100"
        maxHeight="300px"
        isCreatable={false}
      >
        {selectOptions.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}

      {!helperText && (
        <FormHelperText>
          {t(
            'ai:Select an OpenShift version from the list or use the type ahead to narrow down the list.',
          )}
        </FormHelperText>
      )}
    </>
  );
};
