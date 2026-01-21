import * as React from 'react';
import MonacoEditor, { EditorDidMount, EditorWillMount } from 'react-monaco-editor';
import { editor } from 'monaco-editor';
import useResizeObserver from '@react-hook/resize-observer';
import {
  Alert,
  AlertActionCloseButton,
  ClipboardCopyButton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { LoadingState } from '@openshift-assisted/common';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';

const options = { readOnly: true, scrollBeyondLastLine: false };

const theme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: '', background: 'e0e0e0' },
    { token: 'number', foreground: '000000' },
    { token: 'type', foreground: '000000' },
    { token: 'string', foreground: '000000' },
    { token: 'keyword', foreground: '0451a5' },
  ],
  colors: {
    'editor.background': '#e0e0e0',
    'editorGutter.background': '#e0e0e0', // no pf token defined
    'editorLineNumber.activeForeground': '#000000',
    'editorLineNumber.foreground': '#000000',
  },
};

type YamlPreviewProps = {
  code: string;
  setPreviewOpen: (open: boolean) => void;
  loading: boolean;
};

const YamlPreview: React.FC<React.PropsWithChildren<YamlPreviewProps>> = ({
  children,
  code,
  setPreviewOpen,
  loading,
}) => {
  const editorDidMount = React.useCallback<EditorDidMount>((editor) => {
    editor.layout();
    editor.focus();
  }, []);

  const editorWillMount = React.useCallback<EditorWillMount>((monaco) => {
    monaco.editor.defineTheme('acm-console', theme);
  }, []);
  const { t } = useTranslation();
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = React.useState<number>();
  useResizeObserver(editorRef, (entry) => {
    setEditorHeight(entry.contentRect.height);
  });

  return loading ? (
    <LoadingState content="Loading resources" />
  ) : (
    <Stack>
      <StackItem>
        <div>
          <Alert
            isInline
            title={t('ai:The resource has been saved and the YAML is now read only.')}
            variant="info"
            actionClose={<AlertActionCloseButton onClose={() => setPreviewOpen(false)} />}
          />
          <div className="readonly-editor-bar">
            <div>{children}</div>
            <ClipboardCopyButton
              variant="plain"
              id="copy"
              textId="copy"
              onClick={() => void navigator.clipboard.writeText(code)}
            >
              <div />
            </ClipboardCopyButton>
          </div>
        </div>
      </StackItem>
      <StackItem isFilled>
        <div ref={editorRef} style={{ height: '100%' }}>
          {!!editorHeight && (
            <MonacoEditor
              language="yaml"
              theme="acm-console"
              height={editorHeight}
              value={code}
              options={options}
              editorDidMount={editorDidMount}
              editorWillMount={editorWillMount}
            />
          )}
        </div>
      </StackItem>
    </Stack>
  );
};

export default YamlPreview;
