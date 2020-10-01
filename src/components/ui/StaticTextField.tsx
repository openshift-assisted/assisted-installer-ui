import * as React from 'react';
import { FormGroup, TextContent, Text } from '@patternfly/react-core';
import { getFieldId } from './formik/utils';
import HelperText from './formik/HelperText';

export interface StaticFieldProps {
  name: string;
  label: string;
  value: React.ReactNode;
  helperText?: React.ReactNode;
  helperTextInvalid?: React.ReactNode;
  isRequired?: boolean;
  isValid?: boolean;
}

export const StaticField: React.FC<StaticFieldProps> = ({
  label,
  name,
  value,
  helperText,
  helperTextInvalid,
  isRequired,
  isValid = true,
}) => {
  const fieldId = getFieldId(name, 'status');

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      helperText={
        typeof helperText === 'string' ? (
          helperText
        ) : (
          <HelperText fieldId={fieldId}>{helperText}</HelperText>
        )
      }
      helperTextInvalid={helperTextInvalid}
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
    >
      {value}
    </FormGroup>
  );
};

/**
 * Simplified form component for rendering static text.
 * Does not take field value from formik.
 */
export const StaticTextField: React.FC<StaticFieldProps> = ({ value, ...props }) => {
  const fieldId = getFieldId(name, 'status');

  return (
    <StaticField
      {...props}
      value={
        <TextContent>
          <Text component="p" id={fieldId} aria-describedby={`${fieldId}-helper`}>
            {value}
          </Text>
        </TextContent>
      }
    />
  );
};
