import React from 'react';
import { saveAs } from 'file-saver';
import {
  Alert,
  Button,
  ButtonVariant,
  ClipboardCopy,
  clipboardCopyFunc,
  ModalBody,
  ModalFooter,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { DetailItem, DetailList } from '../ui';
import DiscoveryIpxeInstructions from './DiscoveryIpxeInstructions';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type DownloadISOProps = {
  isSNO?: boolean;
  fileName?: string;
  downloadUrl: string;
  onClose: () => void;
  onReset?: () => void;
};

const DownloadIpxeScript = ({
  fileName = 'ipxe-script.txt',
  downloadUrl,
  onClose,
  onReset,
}: DownloadISOProps) => {
  const wgetCommand = `wget -O ${fileName} '${downloadUrl || ''}'`;
  const { t } = useTranslation();
  return (
    <>
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Alert
              isInline
              variant="success"
              title={t('ai:iPXE script file is ready to be downloaded')}
            >
              <>
                &nbsp;
                <DiscoveryIpxeInstructions />
              </>
            </Alert>
          </StackItem>
          <StackItem>
            <DetailList>
              <DetailItem
                title={t('ai:iPXE script file URL')}
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
                title={t('ai:Command to download the iPXE script file')}
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
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.primary}
          onClick={() => downloadUrl && saveAs(downloadUrl)}
          data-testid="download-ipxe-btn"
          isDisabled={!downloadUrl}
        >
          {t('ai:Download script file')}
        </Button>
        {onReset && (
          <Button variant={ButtonVariant.secondary} onClick={onReset} data-testid="close-ipxe-btn">
            {t('ai:Back')}
          </Button>
        )}
        <Button variant={ButtonVariant.link} onClick={onClose} data-testid="edit-ipxe-btn">
          {t('ai:Cancel')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DownloadIpxeScript;
