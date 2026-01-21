import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextArea,
} from '@patternfly/react-core';
import { TextAreaFieldProps } from './types';
import { getFieldId } from './utils';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

const TextAreaField: React.FC<React.PropsWithChildren<TextAreaFieldProps>> = ({
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

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      isRequired={isRequired}
      labelHelp={labelIcon}
      className={groupClassName}
      id={`form-control__${fieldId}`}
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
        onChange={(event) => field.onChange(event)}
        disabled={isDisabled}
      />
      {(errorMessage || helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={'default'}
              id={`${fieldId}-helper`}
              data-testid={`input-textarea-${fieldId}-helper-text`}
            >
              {helperText}
            </HelperTextItem>
            {errorMessage && (
              <HelperTextItem
                icon={<ExclamationCircleIcon />}
                variant={'error'}
                id={`${fieldId}-helper-error`}
                data-testid={`input-textarea-${fieldId}-helper-text`}
              >
                {errorMessage}
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default TextAreaField;
