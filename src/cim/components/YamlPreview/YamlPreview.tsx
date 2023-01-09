import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import Measure from 'react-measure';
import {
  Alert,
  AlertActionCloseButton,
  ClipboardCopyButton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { LoadingState } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const options = { readOnly: true, scrollBeyondLastLine: false };

const theme = {
  base: 'vs',
  inherit: true,
  rules: [
    { background: 'e0e0e0' },
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

const YamlPreview: React.FC<YamlPreviewProps> = ({ children, code, setPreviewOpen, loading }) => {
  const editorDidMount = React.useCallback((editor) => {
    editor.layout();
    editor.focus();
  }, []);

  const editorWillMount = React.useCallback((monaco) => {
    monaco.editor.defineTheme('acm-console', theme);
  }, []);
  const { t } = useTranslation();
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
              onClick={() => navigator.clipboard.writeText(code)}
            >
              <div />
            </ClipboardCopyButton>
          </div>
        </div>
      </StackItem>
      <StackItem isFilled>
        <Measure bounds>
          {({ measureRef, contentRect }) => (
            <div ref={measureRef} style={{ height: '100%' }}>
              {!!contentRect.bounds?.height && (
                <MonacoEditor
                  language="yaml"
                  theme="acm-console"
                  height={contentRect.bounds?.height}
                  value={code}
                  options={options}
                  editorDidMount={editorDidMount}
                  editorWillMount={editorWillMount}
                />
              )}
            </div>
          )}
        </Measure>
      </StackItem>
    </Stack>
  );
};

export default YamlPreview;
