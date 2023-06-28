import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem, Stack, StackItem, debounce } from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CodeEditor } from '@patternfly/react-code-editor';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';
import { monaco } from 'react-monaco-editor';
import { FILE_TYPE_MESSAGE, validateFileName } from '../../../utils';

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
}: CodeFieldProps) => {
  const [field, , { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const [monacoSubscription, setMonacoSubscription] = React.useState<monaco.IDisposable>();
  const [monacoEditor, setMonacoEditor] = React.useState<monaco.editor.IStandaloneCodeEditor>();
  const errorMessage = useFieldErrorMsg({ name, validate });
  const codeEditorRef = React.useRef(null);
  const [isValidValue, setIsValidValue] = React.useState<boolean>(true);

  const onCodeChange = debounce((value: string) => {
    let isValidVal = true;
    if (codeEditorRef && codeEditorRef.current) {
      const codeEditor = codeEditorRef.current as CodeEditor;
      if (codeEditor.state.filename) {
        isValidVal = validateFileName(codeEditor.state.filename || '');
        if (!isValidVal) {
          setValue('', true);
        } else {
          setValue(value, true);
        }
      }
      setIsValidValue(isValidVal);
    }
  }, 100);

  React.useEffect(() => {
    //Work around for Patternfly CodeEditor not calling onChange after upload or drag/drop files
    //The temporary solution is to handle the changes by registering to the change events of the internal editor in CodeEditor
    //Once issue https://github.com/patternfly/patternfly-react/issues/7341 will be resolved this code can be replaced with a simple onChange
    if (!monacoEditor) {
      return;
    }
    if (monacoSubscription) {
      monacoSubscription.dispose();
    }
    setMonacoSubscription(
      monacoEditor.getModel()?.onDidChangeContent(() => {
        setTouched(true);
        isValidValue ? setValue(monacoEditor.getModel()?.getValue(), true) : setValue('', true);
      }),
    );
    return () => {
      if (monacoSubscription) {
        monacoSubscription.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoEditor]);

  const isValid = !errorMessage && isValidValue;
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
          {description && (
            <HelperText fieldId={fieldId}>
              <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
            </HelperText>
          )}
          <CodeEditor
            ref={codeEditorRef}
            code={field.value as string}
            isUploadEnabled={!isDisabled}
            isDownloadEnabled={isValid}
            isCopyEnabled
            isLanguageLabelVisible
            height="400px"
            language={language}
            onEditorDidMount={(editor) => setMonacoEditor(editor)}
            downloadFileName={downloadFileName}
            onCodeChange={onCodeChange}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        {!isValid && (
          <HelperText fieldId={fieldId} isError>
            {!isValidValue ? FILE_TYPE_MESSAGE : errorMessage}
          </HelperText>
        )}
      </StackItem>
    </Stack>
  );
};

export default CodeField;
