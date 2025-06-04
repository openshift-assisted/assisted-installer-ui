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

  const isValid = !errorMessage;

  const pasteFromClipboardFirefox = () => {
    return new Promise((resolve) => {
      const handlePaste = (e: ClipboardEvent) => {
        const text = e?.clipboardData?.getData('text/plain');
        document.removeEventListener('paste', handlePaste);
        resolve(text);
      };
      document.addEventListener('paste', handlePaste);
      alert('Use Ctrl+V to paste the content in this browser');
    });
  };

  const pasteFromClipboard = async (): Promise<string | undefined> => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        return '';
      }
    } else {
      const text = await pasteFromClipboardFirefox();
      return text as string;
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
      isVisible
    />
  );

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      isRequired={isRequired}
      labelHelp={labelIcon}
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
