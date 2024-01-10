import * as React from 'react';
import { useField } from 'formik';
import {
  Checkbox,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CheckboxFieldProps } from './types';
import { getFieldId } from './utils';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  helperText,
  onChange,
  validate,
  idPostfix,
  ...props
}) => {
  const [field, { touched, error }] = useField({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'checkbox', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;

  return (
    <Stack id={`form-control__${fieldId}`}>
      <StackItem>
        <FormGroup fieldId={fieldId}>
          <Checkbox
            {...field}
            {...props}
            id={fieldId}
            label={label}
            aria-describedby={`${fieldId}-helper`}
            description={fieldHelperText}
            isValid={isValid}
            isChecked={field.value as boolean}
            onChange={(event, value) => {
              field.onChange(event);
              onChange && onChange(value, event);
            }}
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

export default CheckboxField;
