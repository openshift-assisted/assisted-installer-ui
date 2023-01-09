import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem } from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CodeEditor } from '@patternfly/react-code-editor';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';
import { monaco } from 'react-monaco-editor';

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
}: CodeFieldProps) => {
  const [field, , { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const [monacoSubscription, setMonacoSubscription] = React.useState<monaco.IDisposable>();
  const [monacoEditor, setMonacoEditor] = React.useState<monaco.editor.IStandaloneCodeEditor>();
  const errorMessage = useFieldErrorMsg({ name, validate });

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
      monacoEditor.onDidChangeModelContent(() => {
        setTouched(true);
        setValue(monacoEditor.getModel()?.getValue(), true);
      }),
    );
    return () => {
      if (monacoSubscription) {
        monacoSubscription.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoEditor]);

  const isValid = !errorMessage;
  return (
    <>
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
        helperTextInvalid={errorMessage}
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
          code={field.value}
          isUploadEnabled={!isDisabled}
          isDownloadEnabled
          isCopyEnabled
          isLanguageLabelVisible
          height="400px"
          language={language}
          onEditorDidMount={(editor) => setMonacoEditor(editor)}
        />
      </FormGroup>
    </>
  );
};

export default CodeField;
