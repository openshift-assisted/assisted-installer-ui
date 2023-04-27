import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Stack, StackItem, Switch, Tooltip } from '@patternfly/react-core';
import { getFieldId } from './utils';
import { SwitchFieldProps } from './types';
import HelperText from './HelperText';

const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  helperText,
  isRequired,
  onChange,
  onChangeCustomOverride,
  getHelperText,
  idPostfix,
  labelIcon,
  tooltipProps,
  switchOuiaId,
  ...props
}) => {
  const [field, { touched, error }] = useField<string>(props.name);
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const hText = getHelperText ? getHelperText(field.value) : helperText;

  const switchFields = {
    ...field,
    id: fieldId,
    label: label,
    isDisabled: props.isDisabled,
    isChecked: Boolean(field.value),
    hasCheckIcon: Boolean(field.value),
    ouiaId: switchOuiaId,
    onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
      if (onChangeCustomOverride) {
        onChangeCustomOverride(checked, event);
      } else {
        field.onChange(event);
        onChange && onChange(checked, event);
      }
    },
  };

  const fieldHelperText = <HelperText fieldId={fieldId}>{hText}</HelperText>;

  return (
    <Stack>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          helperText={fieldHelperText}
          helperTextInvalid={fieldHelperText}
          validated={isValid ? 'default' : 'error'}
          isRequired={isRequired}
          labelIcon={labelIcon}
        >
          {tooltipProps ? (
            <Tooltip {...tooltipProps}>
              <Switch {...switchFields} />
            </Tooltip>
          ) : (
            <Switch {...switchFields} />
          )}
        </FormGroup>
      </StackItem>
      <StackItem>
        {errorMessage && (
          <HelperText fieldId={fieldId} isError>
            {errorMessage}
          </HelperText>
        )}
      </StackItem>
    </Stack>
  );
};

export default SwitchField;
