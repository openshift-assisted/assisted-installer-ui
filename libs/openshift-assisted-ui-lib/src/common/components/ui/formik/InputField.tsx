import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';

const InputField: React.FC<
  InputFieldProps & { inputError?: string; description?: React.ReactNode; labelInfo?: string }
  // eslint-disable-next-line react/display-name
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
      labelInfo,
      showErrorMessage = true,
      ...props
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [field] = useField({
      name: props.name,
      validate,
    });
    const fieldId = getFieldId(props.name, 'input', idPostfix);
    const errorMessage = useFieldErrorMsg({ name: props.name, inputError, validate });
    const isValid = !errorMessage;
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
        helperTextInvalid={showErrorMessage ? errorMessage : undefined}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        labelIcon={labelIcon}
        labelInfo={labelInfo}
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
                if (!props.isDisabled) {
                  !noDefaultOnChange && field.onChange(event);
                  onChange && onChange(event);
                }
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
