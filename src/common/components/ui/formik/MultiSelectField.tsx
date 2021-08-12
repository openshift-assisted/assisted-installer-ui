import React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  Select,
  SelectOption,
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
    const selected = field.value;
    let newValue;
    if (selected.includes(selection)) {
      newValue = selected.filter((sel: string) => sel !== selection);
    } else {
      newValue = [...field.value, selection];
    }
    setValue(newValue);
    onChange && onChange(newValue);
  };

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
        selections={field.value}
      >
        {options
          .filter((option) => !(field.value || []).includes(option.value))
          .map((option, index) => {
            // const { itemCount } = option;
            return (
              <SelectOption
                key={option.id || option.value.toString() || index}
                id={option.id || option.value.toString()}
                value={option.value}
                // itemCount={itemCount} TODO: This is broken ATM
              />
            );
          })}
      </Select>
    </FormGroup>
  );
};

/*
class MultiSelectField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [
        { value: 'Alabama', disabled: false },
        { value: 'Florida', disabled: false },
        { value: 'New Jersey', disabled: false },
        { value: 'New Mexico', disabled: false, description: 'This is a description' },
        { value: 'New York', disabled: false },
        { value: 'North Carolina', disabled: false },
      ],
      isOpen: false,
      selected: [],
      isCreatable: false,
      hasOnCreateOption: false,
    };

    this.onCreateOption = (newValue) => {
      this.setState({
        options: [...this.state.options, { value: newValue }],
      });
    };

    this.onToggle = (isOpen) => {
      this.setState({
        isOpen,
      });
    };

    this.onSelect = (event, selection) => {
      const { selected } = this.state;
      if (selected.includes(selection)) {
        this.setState(
          (prevState) => ({ selected: prevState.selected.filter((item) => item !== selection) }),
          () => console.log('selections: ', this.state.selected),
        );
      } else {
        this.setState(
          (prevState) => ({ selected: [...prevState.selected, selection] }),
          () => console.log('selections: ', this.state.selected),
        );
      }
    };

    this.clearSelection = () => {
      this.setState({
        selected: [],
        isOpen: false,
      });
    };

    this.toggleCreatable = (checked) => {
      this.setState({
        isCreatable: checked,
      });
    };

    this.toggleCreateNew = (checked) => {
      this.setState({
        hasOnCreateOption: checked,
      });
    };
  }

  render() {
    const { isOpen, selected, isCreatable, hasOnCreateOption } = this.state;
    const titleId = 'multi-typeahead-select-id-1';

    return (
      <div>
        <span id={titleId} hidden>
          Select a state
        </span>
        <Select
          variant={SelectVariant.typeaheadMulti}
          typeAheadAriaLabel="Select a state"
          onToggle={this.onToggle}
          onSelect={this.onSelect}
          onClear={this.clearSelection}
          selections={selected}
          isOpen={isOpen}
          aria-labelledby={titleId}
          placeholderText="Select a state"
          isCreatable={isCreatable}
          onCreateOption={(hasOnCreateOption && this.onCreateOption) || undefined}
        >
          {this.state.options.map((option, index) => (
            <SelectOption
              isDisabled={option.disabled}
              key={index}
              value={option.value}
              {...(option.description && { description: option.description })}
            />
          ))}
        </Select>
        <Checkbox
          label="isCreatable"
          isChecked={this.state.isCreatable}
          onChange={this.toggleCreatable}
          aria-label="toggle creatable checkbox"
          id="toggle-creatable-typeahead-multi"
          name="toggle-creatable-typeahead-multi"
        />
        <Checkbox
          label="onCreateOption"
          isChecked={this.state.hasOnCreateOption}
          onChange={this.toggleCreateNew}
          aria-label="toggle new checkbox"
          id="toggle-new-typeahead-multi"
          name="toggle-new-typeahead-multi"
        />
      </div>
    );
  }
}
*/

export default MultiSelectField;
