import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  Spinner,
  Stack,
  StackItem,
  Text,
  Title,
} from '@patternfly/react-core';
import { UploadActionModalProps } from './types';
import { ErrorCircleOIcon, UploadIcon } from '@patternfly/react-icons';
import jsYaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { credentials, host1, host2 } from './constants';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../common/utils';
import './AddBmcHostYamlForm.css';

const AddBmcHostYamlForm: React.FC<UploadActionModalProps> = ({ onClose, onCreateBmcByYaml }) => {
  const [fileName, setFileName] = React.useState<string>();
  const [fileError, setFileError] = React.useState<string>();
  const [showOpenFileButton, setShowOpenFileButton] = React.useState(true);
  const [showOpeningMessage, setShowOpeningMessage] = React.useState(false);
  const [yamlContent, setYamlContent] = React.useState<unknown>();
  const [error, setError] = React.useState<string | undefined>();

  const { t } = useTranslation();

  const downloadYaml = () => {
    const yaml = [credentials, host1, host2].map((doc) => jsYaml.dump(doc)).join('---\n');
    const blob = new Blob([yaml], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'bmc_hosts_template.yaml');
  };

  const importBMAsYAML = () => {
    const input = document.createElement('input');
    input.setAttribute('id', 'importBMAsYaml');
    input.type = 'file';
    input.accept = '.yaml';
    input.style.visibility = 'hidden';
    const body = document.querySelector('body');
    body?.appendChild(input);
    input.onchange = (e: Event) => {
      setShowOpeningMessage(true);
      input.remove();
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      const maxSize = 12582912; //12 Mb
      if (file.size > maxSize) {
        setShowOpenFileButton(false);
        setFileName(file.name);
        setFileError(t('ai:The file is too big. Upload a file up to 12 Mb.'));
        setYamlContent(undefined);
      } else {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (readerEvent) => {
          const content = readerEvent.target?.result;
          // parse yaml
          if (typeof content === 'string') {
            try {
              //await new Promise((r) => setTimeout(r, 100));
              const yamlContent = jsYaml.loadAll(content);
              setFileName(file.name);
              setFileError(undefined);
              setYamlContent(yamlContent);
              setShowOpenFileButton(false);
            } catch (err) {
              setFileName(file.name);
              setFileError(
                t(
                  'ai:File is not structured correctly. Use the template to use the right file structure.',
                ),
              );
              setYamlContent(undefined);
              setShowOpenFileButton(false);
            }
          }
        };
      }
    };
    input.click();
  };

  const deleteFileContent = () => {
    setFileError(undefined);
    setFileName(undefined);
    setShowOpenFileButton(true);
    setShowOpeningMessage(false);
  };

  const handleSubmit = async () => {
    try {
      setShowOpeningMessage(false);
      setError(undefined);
      if (yamlContent !== undefined) {
        await onCreateBmcByYaml(yamlContent);
      }

      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Form>
      <>
        <ModalBoxBody>
          <Stack hasGutter>
            <EmptyState variant={EmptyStateVariant.large}>
              <EmptyStateIcon icon={UploadIcon} />
              <Title headingLevel="h4" size="lg">
                {t('ai:Upload a YAML file')}
              </Title>
              <EmptyStateBody>
                <p>
                  {t(
                    "ai:Upload a YAML file to add hosts's credentials. For each host, include: hostname, Baseboard Mangement Controller Address, username and password",
                  )}
                </p>
                <StackItem>
                  <Button variant={ButtonVariant.link} onClick={downloadYaml}>
                    {t('ai:Download template')}
                  </Button>
                </StackItem>
                {showOpenFileButton && (
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={() => {
                      try {
                        importBMAsYAML();
                      } catch (e) {
                        setError(getErrorMessage(e));
                      }
                    }}
                    isDisabled={showOpeningMessage}
                  >
                    {showOpeningMessage ? (
                      <>
                        {t('ai:Opening file')} <Spinner size="sm" />
                      </>
                    ) : (
                      t('ai:Open file')
                    )}
                  </Button>
                )}
                {fileName && (
                  <>
                    {fileName}&nbsp;
                    <ErrorCircleOIcon onClick={deleteFileContent} />
                  </>
                )}
                <Text className="ai-bmc-yaml__error">{fileError}</Text>
              </EmptyStateBody>
            </EmptyState>
            {error && (
              <StackItem>
                <Alert
                  title={t('ai:Failed to add host by YAML')}
                  variant={AlertVariant.danger}
                  isInline
                  actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
                >
                  {error}
                </Alert>
              </StackItem>
            )}
          </Stack>
        </ModalBoxBody>
        <ModalBoxFooter>
          <Button
            onClick={handleSubmit}
            isDisabled={
              fileName === undefined || (fileName !== undefined && fileError !== undefined)
            }
          >
            {t('ai:Upload')}
          </Button>
          <Button onClick={onClose} variant={ButtonVariant.secondary}>
            {t('ai:Cancel')}
          </Button>
        </ModalBoxFooter>
      </>
    </Form>
  );
};

export default AddBmcHostYamlForm;
