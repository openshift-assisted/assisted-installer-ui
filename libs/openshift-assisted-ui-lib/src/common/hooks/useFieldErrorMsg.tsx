import * as React from 'react';
import { FieldValidator, useField } from 'formik';

type Props = {
  name: string;
  inputError?: string;
  validate?: FieldValidator;
};

// With getRichTextValidation we can receive an array of strings so it needs to be converted to string
const adaptErrorInvalidFormat = (error?: string | string[]): string | undefined => {
  if (Array.isArray(error)) {
    return error.join('. ');
  }
  return error;
};

export const useFieldErrorMsg = ({ name, inputError, validate }: Props): string | undefined => {
  /*
    for empty values - show an error only if at a certain point it was none empty, to avoid new items in a field array shown as invalid right away
    for none empty values - always show the error if there is one
  */
  const [field, { error }] = useField({
    name,
    validate,
  });
  const [hadValue, setHadValue] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (field.value) {
      setHadValue(field.value);
    }
  }, [field.value, setHadValue]);
  const showError = field.value || (!field.value && hadValue);
  const errorMessage = adaptErrorInvalidFormat((showError ? error : '') || inputError);
  return errorMessage;
};

export default useFieldErrorMsg;
