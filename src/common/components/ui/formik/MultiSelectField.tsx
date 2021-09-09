import React from 'react';
import { useField } from 'formik';
import fuzzysearch from 'fuzzysearch';
import {
  FormGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectOptionProps,
  SelectProps,
  SelectVariant,
} from '@patternfly/react-core';
import { MultiSelectFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

// Field value is a string[]
const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  options,
  helperText,
  placeholderText,
  isRequired,
  onChange,
  getHelperText,
  idPostfix,
  labelIcon,
  ...props
}) => {
  const [isOpen, setOpen] = React.useState(false);
  const [field, { touched, error }, { setValue }] = useField(props.name);
  const fieldId = getFieldId(props.name, 'multiinput', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const hText = getHelperText ? getHelperText(field.value) : helperText;

  const onToggle = (isOpen: boolean) => setOpen(isOpen);
  const onClearSelection = () => {
    // onChange && onChange(event);
    setValue([]);
    onChange && onChange([]);
    setOpen(false);
  };

  const onSelect: SelectProps['onSelect'] = (event, selection) => {
    // already selected
    const selected = field.value;

    // selected just now
    const selectionValue =
      (selection as {
        /* TypeScript hack, debug hint: created as part of "selections" array below */ value?: string;
      }).value || selection;

    let newValue;
    if (selected.includes(selectionValue)) {
      newValue = selected.filter((sel: string) => sel !== selectionValue);
    } else {
      newValue = [...field.value, selectionValue];
    }
    setValue(newValue);
    onChange && onChange(newValue);
  };

  // list of already selected options
  const selections: (SelectOptionObject | string)[] = field.value.map((value: string) => {
    const option = options.find((opt) => opt.value === value);
    return option
      ? {
          value: option.value,
          toString: () => option.displayName,
          compareTo: (selectOption: { value: string }) => selectOption.value === value,
        }
      : value;
  });

  const children = options
    .filter((option) => !(field.value || []).includes(option.value))
    .map((option) => {
      // const { itemCount } = option;
      return (
        <SelectOption
          key={option.id}
          id={option.id}
          value={option.value}
          // itemCount={itemCount} TODO: This is broken in Patternfly ATM
        >
          {option.displayName}
        </SelectOption>
      );
    });

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={
        typeof hText === 'string' ? hText : <HelperText fieldId={fieldId}>{hText}</HelperText>
      }
      helperTextInvalid={errorMessage}
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
      labelIcon={labelIcon}
    >
      <Select
        {...field}
        {...props}
        id={fieldId}
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel="Select a state"
        validated={isValid ? 'default' : 'error'}
        aria-describedby={`${fieldId}-helper`}
        isCreatable={false}
        placeholderText={placeholderText}
        isOpen={isOpen}
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={onClearSelection}
        selections={selections}
        onFilter={(e, val) => {
          return (React.Children.toArray(children) as React.ReactElement<
            SelectOptionProps
          >[]).filter(({ props }) => {
            if (val) {
              const option = options.find((o) => o.id === props.id);
              return fuzzysearch(val.toLowerCase(), option?.displayName?.toLowerCase());
            }
            return true;
          });
        }}
      >
        {children}
      </Select>
    </FormGroup>
  );
};

export default MultiSelectField;
