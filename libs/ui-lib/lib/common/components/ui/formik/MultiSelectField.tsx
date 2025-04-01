import React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  LabelGroup,
  Label,
} from '@patternfly/react-core';
import { MultiSelectFieldProps } from './types';
import { getFieldId } from './utils';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import TimesIcon from '@patternfly/react-icons/dist/js/icons/times-icon';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

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
  const [textValue, setTextValue] = React.useState('');
  const [field, { touched, error }, { setValue }] = useField<string[]>(props.name);
  const fieldId = getFieldId(props.name, 'multiinput', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const hText = getHelperText ? getHelperText(field.value?.join(',') || '') : helperText;
  const { t } = useTranslation();

  const onToggle = (isOpen: boolean) => setOpen(isOpen);
  const onClearSelection = () => {
    // onChange && onChange(event);
    setValue([]);
    setTextValue('');
    onChange && onChange([]);
    setOpen(false);
  };

  const onSelect = (selection: string) => {
    // already selected
    const selected = field.value;

    // selected just now
    const selectionValue: string =
      (
        selection as {
          /* TypeScript hack, debug hint: created as part of "selections" array below */ value?: string;
        }
      ).value || selection;

    let newValue: string[];
    if (selected.includes(selectionValue)) {
      newValue = selected.filter((sel: string) => sel !== selectionValue);
    } else {
      newValue = [...field.value, selectionValue];
    }
    setValue(newValue);
    onChange && onChange(newValue);
  };

  const deleteChip = (chip: string) => {
    const newValue = field.value.filter((val) => val !== chip);
    setValue(newValue);
    setTextValue('');
    onChange && onChange(newValue);
  };

  const filteredOptions = options.filter((option) => {
    const value = option.value as string;
    return (
      option.displayName.toLowerCase().includes(textValue.toLowerCase()) &&
      !(field.value || []).includes(value.toString())
    );
  });

  const children = filteredOptions.map((option) => {
    const value = option.value as string;
    return (
      <DropdownItem key={option.id} id={option.id} value={value}>
        {option.displayName}
      </DropdownItem>
    );
  });

  return (
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired} labelIcon={labelIcon}>
      <Dropdown
        id={fieldId}
        isOpen={isOpen}
        onSelect={(event, value) => onSelect(value as string)}
        onOpenChange={onToggle}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            isFullWidth
            onClick={() => onToggle(!isOpen)}
            isExpanded={isOpen}
            variant="typeahead"
          >
            <TextInputGroup>
              <LabelGroup>
                {field.value.map((currentChip) => (
                  <Label
                    key={currentChip}
                    variant="outline"
                    onClose={() => deleteChip(currentChip)}
                  >
                    {currentChip}
                  </Label>
                ))}
              </LabelGroup>
              <TextInputGroupMain
                placeholder={placeholderText}
                onClick={() => onToggle(!isOpen)}
                value={textValue}
                onChange={(event, value) => setTextValue(value)}
              />
              <TextInputGroupUtilities>
                <Button
                  variant="plain"
                  onClick={onClearSelection}
                  aria-label="Clear button and input"
                  icon={<TimesIcon />}
                />
              </TextInputGroupUtilities>
            </TextInputGroup>
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          {children.length ? (
            children
          ) : (
            <DropdownItem
              key="No options available"
              id="No options available"
              value="No options available"
            >
              {t('ai:No options available')}
            </DropdownItem>
          )}
        </DropdownList>
      </Dropdown>
      {(errorMessage || hText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : hText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default MultiSelectField;
