import React from 'react';
import { useField } from 'formik';
import { Radio } from '@patternfly/react-core';
import { getFieldId } from './utils';
import { RadioFieldProps } from './types';

const RadioField: React.FC<RadioFieldProps> = ({ callFormikOnChange = true, ...props }) => {
  const [field] = useField({
    name: props.name,
    value: props.value,
    type: 'radio',
  });
  const fieldId = getFieldId(props.name, 'radio', field.value);

  return (
    <Radio
      {...field}
      id={fieldId}
      label={props.label}
      description={props.description}
      isChecked={!!field.checked}
      isDisabled={props.isDisabled}
      onChange={(checked, e) => {
        props.onChange && props.onChange(checked, e);
        callFormikOnChange && field.onChange(e);
      }}
    />
  );
};

export default RadioField;
