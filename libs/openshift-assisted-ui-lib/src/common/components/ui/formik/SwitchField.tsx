import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Switch, Tooltip } from '@patternfly/react-core';
import { getFieldId } from './utils';
import { SwitchFieldProps } from './types';
import HelperText from './HelperText';

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
  const [field, { touched, error }] = useField(props.name);
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
    onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
      if (onChangeCustomOverride) {
        onChangeCustomOverride(checked, event);
      } else {
        field.onChange(event);
        onChange && onChange(checked, event);
      }
    },
  };
  return (
    <FormGroup
      fieldId={fieldId}
      helperText={
        typeof hText === 'string' ? hText : <HelperText fieldId={fieldId}>{hText}</HelperText>
      }
      helperTextInvalid={errorMessage}
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
      labelIcon={labelIcon}
    >
      {tooltipProps ? (
        <Tooltip {...tooltipProps}>
          <Switch {...switchFields} />
        </Tooltip>
      ) : (
        <Switch {...switchFields} />
      )}
    </FormGroup>
  );
};

export default SwitchField;
