import * as React from 'react';
import { FormGroup, TextContent, Text } from '@patternfly/react-core';
import { getFieldId } from './formik/utils';
import HelperText from './formik/HelperText';

export interface StaticTextFieldProps {
  name: string;
  label: string;
  value: string;
  helperText?: React.ReactNode;
}

/**
 * Simplified form component for rendering static text.
 * Does not take field value from formik.
 */
const StaticTextField: React.FC<StaticTextFieldProps> = ({ label, name, value, helperText }) => {
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
    >
      <TextContent>
        <Text component="p" id={fieldId} aria-describedby={`${fieldId}-helper`}>
          {value}
        </Text>
      </TextContent>
    </FormGroup>
  );
};

export default StaticTextField;
