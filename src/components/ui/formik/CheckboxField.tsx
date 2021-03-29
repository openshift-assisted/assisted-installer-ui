import * as React from 'react';
import { useField } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import { CheckboxFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  helperText,
  onChange,
  validate,
  idPostfix,
  ...props
}) => {
  const [field] = useField({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'checkbox', idPostfix);
  return (
    <Checkbox
      {...field}
      {...props}
      id={fieldId}
      label={label}
      aria-describedby={`${fieldId}-helper`}
      description={
        typeof helperText === 'string' ? (
          helperText
        ) : (
          <HelperText fieldId={fieldId}>{helperText}</HelperText>
        )
      }
      isChecked={field.value}
      onChange={(value, event) => {
        field.onChange(event);
        onChange && onChange(value, event);
      }}
    />
  );
};

export default CheckboxField;
