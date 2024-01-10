import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  TextArea,
} from '@patternfly/react-core';
import { TextAreaFieldProps } from './types';
import { getFieldId } from './utils';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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

  return (
    <Stack id={`form-control__${fieldId}`}>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          label={label}
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
            onChange={(event) => field.onChange(event)}
            disabled={isDisabled}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
            >
              {errorMessage ? errorMessage : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </StackItem>
    </Stack>
  );
};

export default TextAreaField;
