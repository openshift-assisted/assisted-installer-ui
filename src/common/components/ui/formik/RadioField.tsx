import React from 'react';
import { useField } from 'formik';
import { Radio } from '@patternfly/react-core';
import { getFieldId } from './utils';
import { RadioFieldProps } from './types';

const RadioField = ({
  callFormikOnChange = true,
  name,
  value,
  onChange,
  ...rest
}: RadioFieldProps) => {
  const [field] = useField({
    name,
    value,
    type: 'radio',
  });
  const fieldId = getFieldId(name, 'radio', field.value as string | undefined);

  return (
    <Radio
      {...field}
      {...rest}
      id={fieldId}
      isChecked={!!field.checked}
      onChange={(checked, e) => {
        onChange?.(checked, e);
        callFormikOnChange && field.onChange(e);
      }}
    />
  );
};

export default RadioField;
