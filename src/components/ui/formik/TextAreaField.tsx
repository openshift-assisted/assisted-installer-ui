import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextArea } from '@patternfly/react-core';
import { TextAreaProps } from './types';
import { getFieldId } from './utils';

const TextAreaField: React.FC<TextAreaProps> = ({ label, helperText, isRequired, ...props }) => {
  const [field, { touched, error }] = useField(props.name);
  const fieldId = getFieldId(props.name, 'input');
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={helperText}
      helperTextInvalid={errorMessage}
      isValid={isValid}
      isRequired={isRequired}
    >
      <TextArea
        {...field}
        {...props}
        id={fieldId}
        style={{ resize: 'vertical' }}
        isValid={isValid}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        onChange={(_value, event) => field.onChange(event)}
      />
    </FormGroup>
  );
};

export default TextAreaField;
