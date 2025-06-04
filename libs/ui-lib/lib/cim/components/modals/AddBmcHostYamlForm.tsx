import * as React from 'react';
import {
	Alert,
	AlertActionCloseButton,
	AlertVariant,
	Button,
	ButtonVariant,
	EmptyState,
	EmptyStateBody,
	EmptyStateVariant,
	Spinner,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';
import { ErrorCircleOIcon } from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { UploadIcon } from '@patternfly/react-icons/dist/js/icons/upload-icon';
import jsYaml from 'js-yaml';
import { saveAs } from 'file-saver';

import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../common/utils';

import { credentials, host1, host2 } from './constants';
import { UploadActionModalProps } from './types';

import './AddBmcHostYamlForm.css';

const AddBmcHostYamlForm: React.FC<
  Pick<UploadActionModalProps, 'onClose' | 'onCreateBmcByYaml'>
> = ({ onClose, onCreateBmcByYaml }) => {
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
      const maxSize = 12582912; //12 MiB
      if (file.size > maxSize) {
        setShowOpenFileButton(false);
        setFileName(file.name);
        setFileError(t('ai:The file is too big. Upload a file up to 12 MiB.'));
        setYamlContent(undefined);
      } else {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (readerEvent) => {
          const content = readerEvent.target?.result;
          // parse yaml
          if (content && typeof content === 'string') {
            try {
              //await new Promise((r) => setTimeout(r, 100));
              const yamlContent = jsYaml.loadAll(content);
              setFileName(file.name);
              setFileError(undefined);
              setYamlContent(yamlContent);
            } catch (err) {
              setFileName(file.name);
              setFileError(
                t(
                  'ai:File is not structured correctly. Use the template to use the right file structure.',
                ),
              );
              setYamlContent(undefined);
            }
          } else {
            setYamlContent(undefined);
            setFileName(file.name);
            setFileError(
              t(
                'ai:File is not structured correctly. Use the template to use the right file structure.',
              ),
            );
          }

          setShowOpenFileButton(false);
        };
      }
    };
    input.click();
  };

  const deleteFileContent = () => {
    setFileError(undefined);
    setError(undefined);
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
    <>
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            <EmptyState  headingLevel="h4" icon={UploadIcon}  titleText={<>{t('ai:Upload a YAML file')}</>} variant={EmptyStateVariant.lg}>
              <EmptyStateBody>
                <p>
                  {t(
                    'ai:Upload a YAML file with BareMetalHost and Secret resource definitions. Use the provided template as a reference.',
                  )}
                </p>
                <Stack hasGutter>
                  <StackItem>
                    <Button variant={ButtonVariant.link} onClick={downloadYaml}>
                      {t('ai:Download template')}
                    </Button>
                  </StackItem>
                  {showOpenFileButton && (
                    <StackItem>
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
                    </StackItem>
                  )}
                  {fileName && (
                    <StackItem>
                      {fileName}&nbsp;
                      <ErrorCircleOIcon onClick={deleteFileContent} />
                    </StackItem>
                  )}
                </Stack>
              </EmptyStateBody>
            </EmptyState>
          </StackItem>
          {error && (
            <StackItem>
              <Alert
                title={t('ai:Failed to add host by YAML')}
                variant={AlertVariant.danger}
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
              >
                {t(
                  'ai:The YAML file might not be formatted correctly. Use the template to format and try again.',
                )}
                <br />
                {t('ai:Received error:')}&nbsp;{error}
              </Alert>
            </StackItem>
          )}
          {fileError && (
            <StackItem>
              <Alert
                title={t('ai:The file cannot be uploaded')}
                variant={AlertVariant.danger}
                isInline
                actionClose={
                  <AlertActionCloseButton /* onClose={() => setFileError(undefined)}*/ />
                }
              >
                {fileError}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          onClick={() => {
            void handleSubmit();
          }}
          isDisabled={!fileName || !!fileError}
        >
          {t('ai:Upload')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </>
  );
};

export default AddBmcHostYamlForm;
