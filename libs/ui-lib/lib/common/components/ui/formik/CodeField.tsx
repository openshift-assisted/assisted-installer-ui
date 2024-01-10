import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import { CodeEditor } from '@patternfly/react-code-editor';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

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
  isReadOnly,
}: CodeFieldProps) => {
  const [field, , { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const errorMessage = useFieldErrorMsg({ name, validate });

  const isValid = !errorMessage;

  return (
    <Stack>
      <StackItem>
        <FormGroup
          fieldId={fieldId}
          label={label}
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
              setTouched(true);
              setValue(value, true);
            }}
            isReadOnly={isReadOnly}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
            >
              {errorMessage ? errorMessage : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </StackItem>
    </Stack>
  );
};

export default CodeField;
