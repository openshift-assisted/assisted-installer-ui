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

const UploadField: React.FC<UploadFieldProps> = ({
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
  dropzoneProps,
}) => {
  const { t } = useTranslation();

  const [filename, setFilename] = React.useState<string>();
  const [isFileUploading, setIsFileUploading] = React.useState(false);

  const [field, { touched, error }, helpers] = useField<string | File>(name);
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
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired} labelIcon={labelIcon}>
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
        onFileInputChange={(event, file) => {
          setFilename(file.name);
          helpers.setTouched(true);
          helpers.setValue(file);
        }}
        onBlur={(e) => {
          field.onBlur(e);
          onBlur && onBlur(e);
        }}
        onReadStarted={() => setIsFileUploading(true)}
        onReadFinished={() => setIsFileUploading(false)}
        isLoading={isFileUploading}
        disabled={isDisabled}
        dropzoneProps={{
          ...dropzoneProps,
          onDropRejected: () => {
            dropzoneProps?.onDropRejected && dropzoneProps?.onDropRejected(helpers);
          },
        }}
        allowEditingUploadedText={allowEdittingUploadedText}
      />
      {(errorMessage || helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage && <ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
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
