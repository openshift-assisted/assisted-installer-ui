import * as React from 'react';
import { useField } from 'formik';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { CheckboxFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  helperText,
  onChange,
  validate,
  idPostfix,
  ...props
}) => {
  const [field, { touched, error }] = useField({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'checkbox', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;

  return (
    <Stack>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          helperTextInvalid={fieldHelperText}
          validated={isValid ? 'default' : 'error'}
        >
          <Checkbox
            {...field}
            {...props}
            id={fieldId}
            label={label}
            aria-describedby={`${fieldId}-helper`}
            description={fieldHelperText}
            isValid={isValid}
            isChecked={field.value as boolean}
            onChange={(value, event) => {
              field.onChange(event);
              onChange && onChange(value, event);
            }}
          />
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

export default CheckboxField;
