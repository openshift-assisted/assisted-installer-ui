import { useField } from 'formik';
import * as React from 'react';
import TextAreaField from './TextAreaField';
import { trimCommaSeparatedList } from './utils';

type AdditionalNTPSourcesFieldProps = {
  name: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  helperText?: string;
};

const AdditionalNTPSourcesField: React.FC<AdditionalNTPSourcesFieldProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  helperText,
}) => {
  const [field, , { setValue, setTouched }] = useField(name);
  const formatAdditionalNtpSources = () => {
    if (field.value) {
      setValue(trimCommaSeparatedList(field.value));
      setTouched(true);
    }
  };
  return (
    <TextAreaField
      name={name}
      label={label}
      helperText={helperText}
      onBlur={formatAdditionalNtpSources}
      spellCheck={false}
      isRequired={isRequired}
      isDisabled={isDisabled}
    />
  );
};

export default AdditionalNTPSourcesField;
