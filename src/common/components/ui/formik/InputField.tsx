import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  HelperTextItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
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
      // showErrorMessage = true,
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
    const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;
    const isValid = !errorMessage;

    return (
      <>
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
          </StackItem>
          <StackItem>
            {errorMessage && (
              <HelperText fieldId={fieldId} isError>
                {errorMessage}
              </HelperText>
            )}
          </StackItem>
        </Stack>
      </>
    );
  },
);

export default InputField;
