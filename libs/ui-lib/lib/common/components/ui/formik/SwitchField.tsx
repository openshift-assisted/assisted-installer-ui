import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Switch,
  Tooltip,
} from '@patternfly/react-core';
import { getFieldId } from './utils';
import { SwitchFieldProps } from './types';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  helperText,
  isRequired,
  onChange,
  onChangeCustomOverride,
  getHelperText,
  idPostfix,
  labelIcon,
  tooltipProps,
  switchOuiaId,
  ...props
}) => {
  const [field, { touched, error }] = useField<string>(props.name);
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
  const hText = getHelperText ? getHelperText(field.value) : helperText;

  const switchFields = {
    ...field,
    id: fieldId,
    label: label,
    isDisabled: props.isDisabled,
    isChecked: Boolean(field.value),
    hasCheckIcon: Boolean(field.value),
    ouiaId: switchOuiaId,
    onChange: (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
      if (onChangeCustomOverride) {
        onChangeCustomOverride(checked, event);
      } else {
        field.onChange(event);
        onChange && onChange(checked, event);
      }
    },
  };

  return (
    <FormGroup fieldId={fieldId} isRequired={isRequired} labelHelp={labelIcon}>
      {tooltipProps ? (
        <Tooltip {...tooltipProps}>
          <Switch {...switchFields} />
        </Tooltip>
      ) : (
        <Switch {...switchFields} />
      )}
      {(errorMessage || hText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : hText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default SwitchField;
