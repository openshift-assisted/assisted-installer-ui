import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  HelperTextItem,
  Split,
  SplitItem,
  TextInput,
  HelperText as PFHelperText,
  HelperTextItemProps,
} from '@patternfly/react-core';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';
import { InputFieldProps as BaseInputProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

import './InputField.css';

type RichValidationProps = {
  // eslint-disable-next-line
  value: any;
  error: string | undefined;
  richValidationMessages: { [key: string]: string };
};

const RichValidation: React.FC<RichValidationProps> = ({
  value,
  error,
  richValidationMessages,
}) => {
  return (
    <PFHelperText component="ul" className="input-field__rich-text">
      {Object.keys(richValidationMessages).map((key) => {
        const variant: {
          variant: HelperTextItemProps['variant'];
          icon?: HelperTextItemProps['icon'];
        } = !value
          ? { variant: 'indeterminate' }
          : error?.includes(richValidationMessages[key])
          ? { variant: 'error', icon: <TimesIcon /> }
          : { variant: 'success', icon: <CheckIcon /> };
        return (
          <HelperTextItem key={key} isDynamic component="li" {...variant}>
            {richValidationMessages[key]}
          </HelperTextItem>
        );
      })}
    </PFHelperText>
  );
};

type InputFieldPropsProps = BaseInputProps & {
  inputError?: string;
  description?: React.ReactNode;
  richValidationMessages?: RichValidationProps['richValidationMessages'];
};

const InputField: React.FC<InputFieldPropsProps> = React.forwardRef(
  (
    {
      label,
      labelIcon,
      helperText,
      isRequired,
      onChange,
      validate,
      idPostfix,
      children,
      noDefaultOnChange,
      inputError,
      description,
      richValidationMessages,
      ...props
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [field, { touched, error, value }] = useField({ name: props.name, validate });
    const fieldId = getFieldId(props.name, 'input', idPostfix);
    const isValid = richValidationMessages ? true : inputError ? false : !(touched && error);
    const errorMessage = (!isValid ? error : '') || inputError;
    return (
      <FormGroup
        fieldId={fieldId}
        label={label}
        helperText={
          richValidationMessages ? (
            <RichValidation
              value={value}
              error={error}
              richValidationMessages={richValidationMessages}
            />
          ) : typeof helperText === 'string' ? (
            helperText
          ) : (
            <HelperText fieldId={fieldId}>{helperText}</HelperText>
          )
        }
        helperTextInvalid={errorMessage}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        labelIcon={labelIcon}
      >
        {description && (
          <HelperText fieldId={fieldId}>
            <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
          </HelperText>
        )}
        <Split>
          <SplitItem isFilled>
            <TextInput
              {...field}
              {...props}
              ref={ref}
              id={fieldId}
              validated={isValid ? 'default' : 'error'}
              isRequired={isRequired}
              aria-describedby={`${fieldId}-helper`}
              onChange={(value, event) => {
                !noDefaultOnChange && field.onChange(event);
                onChange && onChange(event);
              }}
            />
          </SplitItem>
          <SplitItem>{children}</SplitItem>
        </Split>
      </FormGroup>
    );
  },
);

export default InputField;
