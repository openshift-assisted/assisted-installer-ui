import React from 'react';
import { saveAs } from 'file-saver';
import {
  Alert,
  Button,
  ButtonVariant,
  ClipboardCopy,
  clipboardCopyFunc,
  ModalBoxBody,
  ModalBoxFooter,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { DetailItem, DetailList } from '../ui';
import DiscoveryInstructions from './DiscoveryInstructions';
import { StaticIPInfo } from './DiscoveryImageConfigForm';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type DownloadISOProps = {
  hasDHCP?: boolean;
  isSNO?: boolean;
  fileName?: string;
  downloadUrl?: string;
  onClose: () => void;
  onReset?: () => void;
};

const DownloadIso = ({
  fileName = 'discovery.iso',
  downloadUrl,
  onClose,
  onReset,
  hasDHCP,
  isSNO = false,
}: DownloadISOProps) => {
  const wgetCommand = `wget -O ${fileName} '${downloadUrl || ''}'`;
  const { t } = useTranslation();
  return (
    <>
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            <Alert
              isInline
              variant="success"
              title={t('ai:Discovery ISO is ready to be downloaded')}
            >
              <>
                &nbsp;
                <DiscoveryInstructions isSNO={isSNO} />
              </>
            </Alert>
          </StackItem>
          {hasDHCP === false && (
            <StackItem>
              <StaticIPInfo />
            </StackItem>
          )}
          <StackItem>
            <DetailList>
              <DetailItem
                title={t('ai:Discovery ISO URL')}
                value={
                  <ClipboardCopy
                    isReadOnly
                    onCopy={(event) => clipboardCopyFunc(event, downloadUrl)}
                  >
                    {downloadUrl}
                  </ClipboardCopy>
                }
              />
              <DetailItem
                title={t('ai:Command to download the ISO:')}
                value={
                  <ClipboardCopy
                    isReadOnly
                    onCopy={(event) => clipboardCopyFunc(event, wgetCommand)}
                  >
                    {wgetCommand}
                  </ClipboardCopy>
                }
              />
            </DetailList>
            <Alert
              variant="info"
              isInline
              title={`${t('ai:Never share your downloaded ISO with anyone else.')} ${t(
                'ai:Forwarding it could put your credentials and personal data at risk.',
              )}`}
            />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          variant={ButtonVariant.primary}
          onClick={() => downloadUrl && saveAs(downloadUrl)}
          data-testid="download-iso-btn"
          isDisabled={!downloadUrl}
        >
          {t('ai:Download Discovery ISO')}
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onClose} data-testid="close-iso-btn">
          {t('ai:Close')}
        </Button>
        {onReset && (
          <Button variant={ButtonVariant.link} onClick={onReset} data-testid="edit-iso-btn">
            {t('ai:Edit ISO configuration')}
          </Button>
        )}
      </ModalBoxFooter>
    </>
  );
};

export default DownloadIso;
