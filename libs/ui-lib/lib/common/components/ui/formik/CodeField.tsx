import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem, Stack, StackItem } from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CodeEditor } from '@patternfly/react-code-editor';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';

const CodeField = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  validate,
  idPostfix,
  language,
  name,
  description,
  isDisabled,
  downloadFileName,
  dataTestid,
}: CodeFieldProps) => {
  const [field, , { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const errorMessage = useFieldErrorMsg({ name, validate });

  const isValid = !errorMessage;
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
          data-testid={dataTestid ? dataTestid : `${fieldId}-testid`}
        >
          {description && (
            <HelperText fieldId={fieldId}>
              <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
            </HelperText>
          )}
          <CodeEditor
            code={field.value as string}
            isUploadEnabled={!isDisabled}
            isDownloadEnabled={isValid}
            isCopyEnabled
            isLanguageLabelVisible
            height="400px"
            language={language}
            downloadFileName={downloadFileName}
            onCodeChange={(value) => {
              if (value !== '') {
                setTouched(true);
                setValue(value, true);
              }
            }}
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

export default CodeField;
