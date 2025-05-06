import * as React from 'react';
import {
  FormGroup,
  FileUpload,
  FormHelperText,
  HelperText,
  HelperTextItem,
  DropEvent,
} from '@patternfly/react-core';
import { UploadFieldProps } from './types';
import { getFieldId } from './utils';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { useField } from 'formik';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { FileRejection } from 'react-dropzone';

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
  const acceptedFiles = {
    'application/x-pem-file': ['.pem', '.crt', '.ca', '.cert'],
    'application/x-x509-ca-cert': ['.pem', '.crt', '.ca', '.cert'],
    'text/plain': ['.pem', '.crt', '.ca', '.cert'],
  };
  const fieldId = getFieldId(name, 'input', idPostfix);
  const [field, , { setValue }] = useField<string | File>(name);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleFileInputChange = (_event: DropEvent, file: File) => {
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

  const handleFileRejected = (_rejectedFiles: FileRejection[]) => {
    if (_rejectedFiles[0].file.size > maxFileSize) {
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
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired} labelHelp={labelIcon}>
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
        onDataChange={(_event, value: string) => handleTextOrDataChange(value)}
        onTextChange={(_event, value: string) => handleTextOrDataChange(value)}
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
      {(errorMessage || helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage && <ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default CertificatesUploadField;
