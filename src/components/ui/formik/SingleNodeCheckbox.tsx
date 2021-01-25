import * as React from 'react';
import { useField } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import { CheckboxFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const SingleNodeCheckbox: React.FC<CheckboxFieldProps> = ({ validate, idPostfix, ...props }) => {
  const [field, meta, helpers] = useField<'None' | 'Full'>({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  const { value } = meta;
  const { setValue } = helpers;

  return (
    <Checkbox
      {...field}
      {...props}
      id={fieldId}
      label="I want to install single node OpenShift (SNO)"
      aria-describedby={`${fieldId}-helper`}
      description={
        <HelperText fieldId={fieldId}>
          {'This enables you to install OpenShift using only 1 host.'}
        </HelperText>
      }
      isChecked={value === 'None'}
      onChange={(checked) => setValue(checked ? 'None' : 'Full')}
    />
  );
};

export default SingleNodeCheckbox;
