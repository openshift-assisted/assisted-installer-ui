import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Stack, StackItem, TextArea } from '@patternfly/react-core';
import { TextAreaFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  helperText,
  getErrorText,
  isRequired,
  children,
  idPostfix,
  labelIcon,
  groupClassName,
  ...props
}) => {
  const [field, { touched, error }] = useField(props.name);
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);

  const getErrorMessage = () => {
    if (!isValid && error) {
      return getErrorText ? getErrorText(error) : error;
    }
    return '';
  };

  const errorMessage = getErrorMessage();
  const { isDisabled, ...restProps } = props;
  const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;

  return (
    <Stack>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          label={label}
          helperText={fieldHelperText}
          helperTextInvalid={fieldHelperText}
          validated={isValid ? 'default' : 'error'}
          isRequired={isRequired}
          labelIcon={labelIcon}
          className={groupClassName}
        >
          {children}
          <TextArea
            {...field}
            {...restProps}
            id={fieldId}
            style={{ resize: 'vertical' }}
            validated={isValid ? 'default' : 'error'}
            isRequired={isRequired}
            aria-describedby={`${fieldId}-helper`}
            onChange={(value, event) => field.onChange(event)}
            disabled={isDisabled}
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

export default TextAreaField;
