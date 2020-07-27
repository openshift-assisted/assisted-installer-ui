import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, TextArea } from '@patternfly/react-core';
import { TextAreaProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const TextAreaField: React.FC<TextAreaProps> = ({
  label,
  helperText,
  getErrorText,
  isRequired,
  children,
  ...props
}) => {
  const [field, { touched, error }] = useField(props.name);
  const fieldId = getFieldId(props.name, 'input');
  const isValid = !(touched && error);

  const getErrorMessage = () => {
    if (!isValid && error) {
      return getErrorText ? getErrorText(error) : error;
    }
    return '';
  };
  const errorMessage = getErrorMessage();

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
      helperTextInvalid={
        typeof errorMessage === 'string' ? (
          errorMessage
        ) : (
          <HelperText fieldId={fieldId} isError>
            {errorMessage}
          </HelperText>
        )
      }
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
    >
      {children}
      <TextArea
        {...field}
        {...props}
        id={fieldId}
        style={{ resize: 'vertical' }}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        onChange={(value, event) => field.onChange(event)}
      />
    </FormGroup>
  );
};

export default TextAreaField;
