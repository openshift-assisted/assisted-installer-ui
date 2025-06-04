import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
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
    const isValid = !(touched && error);

    return (
      <FormGroup
        id={`form-control__${fieldId}`}
        fieldId={fieldId}
        label={label}
        isRequired={isRequired}
        labelHelp={labelIcon}
        labelInfo={labelInfo}
      >
        {description && (
          <HelperText>
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
              onChange={(event) => {
                if (!props.isDisabled) {
                  !noDefaultOnChange && field.onChange(event);
                  onChange && onChange(event);
                }
              }}
            />
          </SplitItem>
          <SplitItem>{children}</SplitItem>
        </Split>
        {((showErrorMessage && !isValid) || helperText) && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem
                icon={errorMessage && <ExclamationCircleIcon />}
                variant={showErrorMessage ? 'error' : 'default'}
                id={showErrorMessage && !isValid ? `${fieldId}-helper-error` : `${fieldId}-helper`}
              >
                {showErrorMessage ? errorMessage : helperText}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    );
  },
);

export default InputField;
