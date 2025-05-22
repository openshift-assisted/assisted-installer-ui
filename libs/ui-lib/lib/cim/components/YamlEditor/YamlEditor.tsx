import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import * as React from 'react';
import * as monaco from 'monaco-editor';
import * as yaml from 'js-yaml';
import { loader } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { K8sResourceCommon, useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import { CodeEditor, Language } from '@patternfly/react-code-editor';

import { defineConsoleThemes } from './Theme';
import { useStateSafely, useTranslation } from '../../../common';
import { getErrorMessage } from '../../../common/utils';
import { submitYamls } from './utils';

import './YamlEditor.css';

// Avoid using monaco from CDN
loader.config({ monaco });
type Monaco = typeof monacoEditor;

const YamlEditor = ({
  resources,
  onClose,
  onSubmit,
}: {
  resources: K8sResourceCommon[];
  onClose: VoidFunction;
  onSubmit: (submittedResources: K8sResourceCommon[]) => void;
}) => {
  const { t } = useTranslation();
  const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = React.useRef<typeof monacoEditor | null>(null);
  const [isSubmitting, setIsSubmitting] = useStateSafely(false);
  const [error, setError] = React.useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);
  const [editorMounted, setEditorMounted] = React.useState(false);
  const [code, setCode] = React.useState(
    resources.length > 0 ? resources.map((r) => yaml.dump(r)).join('\n---\n') : '',
  );

  React.useEffect(() => {
    if (editorMounted) {
      // Prevent all brackets/curly braces by being highlighted by default
      monaco.languages.setLanguageConfiguration('yaml', {
        colorizedBracketPairs: [],
      });
    }
  }, [editorMounted]);

  const [models] = useK8sModels();

  const submit = async () => {
    setIsSubmitting(true);
    setError(undefined);
    try {
      const resources = await submitYamls(t, code, Object.values(models));
      onSubmit(resources);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        className="cim-yaml-modal"
        isOpen
        title={t('ai:Edit YAML')}
        variant="large"
        onClose={() => !isSubmitting && setShowCloseConfirm(true)}
        actions={[
          <Button
            key="submit"
            variant="primary"
            aria-label={t('ai:Submit')}
            onClick={() => void submit()}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {t('ai:Submit')}
          </Button>,
          <Button
            key="cancel"
            variant="secondary"
            aria-label={t('ai:Cancel')}
            onClick={() => setShowCloseConfirm(true)}
            isDisabled={isSubmitting}
          >
            {t('ai:Cancel')}
          </Button>,
        ]}
      >
        <Stack className="cim-yaml-editor">
          <StackItem isFilled>
            <CodeEditor
              copyButtonAriaLabel={t('ai:Copy to clipboard')}
              copyButtonSuccessTooltipText={t('ai:Content copied to clipboard')}
              copyButtonToolTipText={t('ai:Copy to clipboard')}
              downloadButtonAriaLabel={t('ai:Download yaml')}
              downloadButtonToolTipText={t('ai:Download yaml')}
              shortcutsPopoverButtonText={t('ai:View shortcuts')}
              emptyStateBody={t('ai:Drag and drop a file or upload one.')}
              emptyStateButton={t('ai:Browse')}
              emptyStateLink={t('ai:Start from scratch')}
              emptyStateTitle={t('ai:Start editing')}
              language={Language.yaml}
              code={code}
              onChange={(v) => setCode(v)}
              onEditorDidMount={(
                editor: monacoEditor.editor.IStandaloneCodeEditor,
                instance: Monaco,
              ) => {
                setEditorMounted(true);
                defineConsoleThemes(instance);
                editorRef.current = editor;
                monacoRef.current = instance;
              }}
              options={{
                theme: 'console-dark',
                readOnly: isSubmitting,
              }}
              height="600px"
            />
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title={error} />
            </StackItem>
          )}
        </Stack>
      </Modal>
      {showCloseConfirm && (
        <Modal
          title={t('ai:Exit YAML?')}
          titleIconVariant="warning"
          isOpen
          onClose={() => setShowCloseConfirm(false)}
          actions={[
            <Button key="leave" variant="primary" aria-label={t('ai:Leave')} onClick={onClose}>
              {t('ai:Leave')}
            </Button>,
            <Button
              key="stay"
              variant="secondary"
              aria-label={t('ai:Stay')}
              onClick={() => setShowCloseConfirm(false)}
            >
              {t('ai:Stay')}
            </Button>,
          ]}
          variant="small"
        >
          {t('ai:Changes you made will be discarded')}
        </Modal>
      )}
    </>
  );
};

export default YamlEditor;
