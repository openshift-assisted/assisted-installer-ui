import * as React from 'react';
import { FieldHelperProps, useField } from 'formik';
import { FormGroup, FileUpload, Stack, StackItem } from '@patternfly/react-core';
import { UploadFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

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

  const fieldHelperText = <HelperText fieldId={fieldId}>{helperText}</HelperText>;

  return (
    <Stack>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          label={label}
          helperText={fieldHelperText}
          helperTextInvalid={fieldHelperText}
          validated={isValid ? 'default' : 'error'}
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
            validated={isValid ? 'default' : 'error'}
            isRequired={isRequired}
            aria-describedby={`${fieldId}-helper`}
            type="text"
            value={field.value as string}
            filename={filename}
            onChange={(value, filename) => {
              setFilename(filename);
              helpers.setTouched(true);
              helpers.setValue(value);
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
              onDropRejected:
                dropzoneProps?.onDropRejected &&
                dropzoneProps?.onDropRejected(helpers as FieldHelperProps<string>),
            }}
            allowEditingUploadedText={allowEdittingUploadedText}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        {errorMessage && (
          <HelperText fieldId={fieldId} isError>
            {errorMessage}
          </HelperText>
        )}
      </StackItem>
    </Stack>
  );
};

export default UploadField;
