import * as React from 'react';
import { FormGroup, FileUpload } from '@patternfly/react-core';
import { UploadFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { useField } from 'formik';

const CertificatesUploadField: React.FC<UploadFieldProps> = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  children,
  idPostfix,
  isDisabled,
  name,
}) => {
  const { t } = useTranslation();

  const maxFileSize = 100000; //100 kb
  const maxFileSizeKb = 100;
  const acceptedFiles =
    '.pem,.crt,.ca,.cert,application/x-pem-file,application/x-x509-ca-cert,text/plain';

  const fieldId = getFieldId(name, 'input', idPostfix);
  const [field, , { setValue }] = useField<string | File>(name);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File,
  ) => {
    setFilename(file.name);
  };

  const handleTextOrDataChange = (value: string) => {
    const contentFile = new Blob([value], { type: 'text/plain;charset=utf-8' });
    if (contentFile.size > maxFileSize) {
      setIsRejected(true);
      setErrorMessage(
        t('ai:File size is too big. Upload a new {{maxFileSizeKb}} Kb or less.', { maxFileSizeKb }),
      );
      setValue(value);
    } else {
      setIsRejected(false);
      setErrorMessage('');
      setValue(value);
    }
  };

  const handleClear = () => {
    setFilename('');
    setValue('');
    setIsRejected(false);
    setErrorMessage('');
  };

  const handleFileRejected = (_rejectedFiles: File[]) => {
    if (_rejectedFiles[0].size > maxFileSize) {
      setIsRejected(true);
      setErrorMessage(
        t('ai:File size is too big. Upload a new {{maxFileSizeKb}} Kb or less.', { maxFileSizeKb }),
      );
    } else {
      setIsRejected(true);
      setErrorMessage(
        t('ai:File type is not supported. File type must be {{acceptedFiles}}.', { acceptedFiles }),
      );
    }
  };

  const handleFileReadStarted = () => {
    setIsLoading(true);
  };

  const handleFileReadFinished = () => {
    setIsLoading(false);
  };

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
      validated={isRejected ? 'error' : 'default'}
      isRequired={isRequired}
      labelIcon={labelIcon}
    >
      {children}
      <FileUpload
        filenamePlaceholder={t('ai:Drag a file here or browse to upload')}
        browseButtonText={t('ai:Browse...')}
        clearButtonText={t('ai:Clear')}
        id={field.name}
        style={{ resize: 'vertical' }}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        type="text"
        value={field.value}
        filename={filename}
        onFileInputChange={handleFileInputChange}
        onDataChange={handleTextOrDataChange}
        onTextChange={handleTextOrDataChange}
        onReadStarted={handleFileReadStarted}
        onReadFinished={handleFileReadFinished}
        onClearClick={handleClear}
        isLoading={isLoading}
        dropzoneProps={{
          accept: acceptedFiles,
          maxSize: maxFileSize,
          onDropRejected: handleFileRejected,
        }}
        validated={isRejected ? 'error' : 'default'}
        disabled={isDisabled}
        allowEditingUploadedText={true}
      />
    </FormGroup>
  );
};

export default CertificatesUploadField;
