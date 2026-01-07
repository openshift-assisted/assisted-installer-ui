import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FileUpload,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { UploadFieldProps } from './types';
import { getFieldId } from './utils';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

const MAX_FILE_SIZE = 2048;
const ACCEPTED_FILES = { 'application/x-ssh-key': ['.pub'] };

const UploadField: React.FC<React.PropsWithChildren<UploadFieldProps>> = ({
  label,
  labelIcon,
  helperText,
  getErrorText,
  isRequired,
  children,
  idPostfix,
  isDisabled,
  name,
  onBlur,
  allowEdittingUploadedText = true,
}) => {
  const { t } = useTranslation();

  const [filename, setFilename] = React.useState<string>();
  const [isFileUploading, setIsFileUploading] = React.useState(false);

  const [field, { touched, error }, { setValue, setTouched }] = useField<string | File>(name);
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
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired} labelHelp={labelIcon}>
      {children}
      <FileUpload
        filenamePlaceholder={t('ai:Drag a file here or browse to upload')}
        browseButtonText={t('ai:Browse...')}
        clearButtonText={t('ai:Clear')}
        id={field.name}
        style={{ resize: 'vertical' }}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        aria-describedby={`${fieldId}-helper`}
        type="text"
        value={field.value as string}
        filename={filename}
        data-testid={`upload-field-${fieldId}`}
        onDataChange={(_event, file: string) => {
          setValue(file);
          setTouched(true);
        }}
        onTextChange={(_event, file: string) => {
          setValue(file);
          setTouched(true);
        }}
        onFileInputChange={(_event, file) => {
          setFilename(file.name);
          setTouched(true);
        }}
        onBlur={(e) => {
          const file: File | string = field.value;
          if (file instanceof File) {
            const reader = new FileReader();

            reader.onload = (event) => {
              if (event.target) {
                const contentAsString = event.target.result as string;
                onBlur && onBlur(e, contentAsString);
              }
            };

            // Read the file content as text
            reader.readAsText(file);
          } else {
            onBlur && onBlur(e, file);
          }
        }}
        onReadStarted={() => setIsFileUploading(true)}
        onReadFinished={() => setIsFileUploading(false)}
        isLoading={isFileUploading}
        disabled={isDisabled}
        allowEditingUploadedText={allowEdittingUploadedText}
        dropzoneProps={{
          accept: ACCEPTED_FILES,
          maxSize: MAX_FILE_SIZE,
        }}
        onClearClick={() => {
          setFilename('');
          setValue('');
        }}
      />
      {(errorMessage || helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage && <ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
              data-testid={`input-uploadfield-${fieldId}-helper-text`}
            >
              {errorMessage ? errorMessage : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default UploadField;
