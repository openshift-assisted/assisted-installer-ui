import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  Content,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { getFieldId } from './formik';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

export interface StaticFieldProps {
  name: string;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  helperTextInvalid?: React.ReactNode;
  isRequired?: boolean;
  isValid?: boolean;
}

export const StaticField: React.FC<StaticFieldProps> = ({
  label,
  name,
  children,
  helperText,
  helperTextInvalid,
  isRequired,
  isValid = true,
}) => {
  const fieldId = getFieldId(name, 'static');

  return (
    <FormGroup
      id={`form-control__${fieldId}`}
      fieldId={fieldId}
      label={label}
      isRequired={isRequired}
    >
      {children}
      {(helperText || helperTextInvalid) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={isValid ? 'default' : 'error'}
              id={isValid ? `${fieldId}-helper` : `${fieldId}-helper-error`}
            >
              {isValid ? helperText : helperTextInvalid}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

/**
 * Static Formik field which sets value prop as formik field value
 */
type FormikStaticFieldProps = {
  value: string;
} & StaticFieldProps;

export const FormikStaticField: React.FC<FormikStaticFieldProps> = ({ value, ...props }) => {
  const [, , helpers] = useField({ name: props.name });

  React.useEffect(() => {
    helpers.setValue(value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <StaticField {...props} />;
};

/**
 * Simplified form component for rendering static text.
 * Does not reflect field value from formik.
 */
export const StaticTextField: React.FC<StaticFieldProps> = ({ children, ...props }) => {
  const fieldId = getFieldId(props.name, 'static');

  return (
    <StaticField {...props}>
      <Content>
        <Content component="p" id={fieldId} aria-describedby={`${fieldId}-helper`}>
          {children}
        </Content>
      </Content>
    </StaticField>
  );
};
