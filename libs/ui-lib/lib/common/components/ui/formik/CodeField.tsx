import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import { CodeEditor, CodeEditorControl } from '@patternfly/react-code-editor';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import PasteIcon from '@patternfly/react-icons/dist/js/icons/paste-icon';

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
  showCustomControls = false,
}: CodeFieldProps) => {
  const [field, , { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const errorMessage = useFieldErrorMsg({ name, validate });
  const [code] = React.useState('Some example content');

  const isValid = !errorMessage;

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard contents: ', err);
      return '';
    }
  };

  const customControl = (
    <CodeEditorControl
      icon={<PasteIcon />}
      aria-label="Paste content"
      tooltipProps={{ content: 'Paste content' }}
      onClick={() => {
        void pasteFromClipboard().then((text) => setValue(text, true));
      }}
      isVisible={code !== ''}
    />
  );

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      isRequired={isRequired}
      labelIcon={labelIcon}
      data-testid={dataTestid ? dataTestid : `${fieldId}-testid`}
    >
      {description && (
        <HelperText>
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
        customControls={showCustomControls ? customControl : undefined}
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

export default CodeField;
