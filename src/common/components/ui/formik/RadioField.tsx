import React from 'react';
import { useField } from 'formik';
import { Radio, RadioProps } from '@patternfly/react-core';
import { getFieldId } from './utils';

const RadioField: React.FC<Optional<RadioProps, 'id'>> = (props) => {
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
      isChecked={!!field.checked}
      isDisabled={props.isDisabled}
      onChange={(checked, e) => {
        props.onChange && props.onChange(checked, e);
        field.onChange(e);
      }}
    />
  );
};

export default RadioField;
