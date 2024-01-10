import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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
      description,
      labelInfo,
      showErrorMessage = true,
      ...props
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [field, { error, touched }] = useField({
      name: props.name,
      validate,
    });

    const fieldId = getFieldId(props.name, 'input', idPostfix);
    const errorMessage = useFieldErrorMsg({ name: props.name, inputError: error, validate });
    const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;
    const isValid = !(touched && error);

    return (
      <Stack id={`form-control__${fieldId}`}>
        <StackItem>
          <FormGroup
            fieldId={fieldId}
            label={label}
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
                  onChange={(event, value) => {
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
          <FormHelperText>
            <HelperText>
              <HelperTextItem
                icon={<ExclamationCircleIcon />}
                variant={showErrorMessage ? 'error' : 'default'}
              >
                {showErrorMessage ? errorMessage : helperText}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </StackItem>
      </Stack>
    );
  },
);

export default InputField;
