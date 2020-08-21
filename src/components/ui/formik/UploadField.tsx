import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FileUpload } from '@patternfly/react-core';
import { TextAreaProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const UploadField: React.FC<TextAreaProps> = ({
  label,
  helperText,
  getErrorText,
  isRequired,
  children,
  idPostfix,
  isDisabled,
  name,
}) => {
  const [filename, setFilename] = React.useState<string>();
  const [isSSHKeyUploading, setSSHKeyUploading] = React.useState(false);

  const [field, { touched, error }, { setError, setValue }] = useField(name);
  const fieldId = getFieldId(name, 'input', idPostfix);
  const isValid = !((touched || filename) && error);

  const getErrorMessage = () => {
    if (!isValid && error) {
      return getErrorText ? getErrorText(error) : error;
    }
    return '';
  };
  const errorMessage = getErrorMessage();

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
      helperTextInvalid={
        typeof errorMessage === 'string' ? (
          errorMessage
        ) : (
          <HelperText fieldId={fieldId} isError>
            {errorMessage}
          </HelperText>
        )
      }
      validated={isValid ? 'default' : 'error'}
      isRequired={isRequired}
    >
      {children}
      <FileUpload
        id={fieldId}
        style={{ resize: 'vertical' }}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        type="text"
        value={field.value}
        filename={filename}
        onChange={(value, filename) => {
          setFilename(filename);
          setValue(value);
        }}
        onReadStarted={() => setSSHKeyUploading(true)}
        onReadFinished={() => setSSHKeyUploading(false)}
        isLoading={isSSHKeyUploading}
        disabled={isDisabled}
        dropzoneProps={{
          accept: '.pub',
          maxSize: 2048,
          onDropRejected: () => setError('File not supported.'),
        }}
      />
    </FormGroup>
  );
};

export default UploadField;
