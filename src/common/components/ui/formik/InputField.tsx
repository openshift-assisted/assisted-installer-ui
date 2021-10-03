import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const InputField: React.FC<
  InputFieldProps & { inputError?: string; description?: React.ReactNode }
> = React.forwardRef(
  (
    {
      label,
      labelIcon,
      helperText,
      isRequired,
      onChange,
      validate,
      idPostfix,
      children,
      noDefaultOnChange,
      inputError,
      description,
      ...props
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [field, { touched, error }] = useField({ name: props.name, validate });
    const fieldId = getFieldId(props.name, 'input', idPostfix);
    const isValid = inputError ? false : !(touched && error);
    const errorMessage = (!isValid ? error : '') || inputError;
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
        labelIcon={labelIcon}
      >
        {description && (
          <HelperText fieldId={fieldId}>
            <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
          </HelperText>
        )}
        <Split>
          <SplitItem isFilled>
            <TextInput
              {...field}
              {...props}
              ref={ref}
              id={fieldId}
              validated={isValid ? 'default' : 'error'}
              isRequired={isRequired}
              aria-describedby={`${fieldId}-helper`}
              onChange={(value, event) => {
                !noDefaultOnChange && field.onChange(event);
                onChange && onChange(event);
              }}
            />
          </SplitItem>
          <SplitItem>{children}</SplitItem>
        </Split>
      </FormGroup>
    );
  },
);

export default InputField;
