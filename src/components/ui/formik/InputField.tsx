import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextInput } from '@patternfly/react-core';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  isRequired,
  onChange,
  validate,
  idPostfix,
  ...props
}) => {
  const [field, { touched, error }] = useField({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { innerRef, ...passedProps } = props;

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={
        typeof helperText === 'string' ? (
          helperText
        ) : (
          <HelperText fieldId={fieldId}>{helperText}</HelperText>
        )
      }
      helperTextInvalid={errorMessage}
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
    >
      <TextInput
        {...field}
        {...passedProps}
        id={fieldId}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        onChange={(value, event) => {
          field.onChange(event);
          onChange && onChange(event);
        }}
      />
    </FormGroup>
  );
};

export default InputField;
