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
import DiscoveryIpxeInstructions from './DiscoveryIpxeInstructions';
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

const DownloadIpxeScript = ({
  fileName = 'ipxe-script.txt',
  downloadUrl,
  onClose,
  onReset,
  hasDHCP,
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
              title={t('ai:iPXE script are ready to be downloaded')}
            >
              <>
                &nbsp;
                <DiscoveryIpxeInstructions />
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
                title={t('ai:iPXE script URL')}
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
                title={t('ai:Command to download the iPXE script')}
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
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          variant={ButtonVariant.primary}
          onClick={() => downloadUrl && saveAs(downloadUrl)}
          data-testid="download-ipxe-btn"
          isDisabled={!downloadUrl}
        >
          {t('ai:Download script')}
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onClose} data-testid="close-ipxe-btn">
          {t('ai:Close')}
        </Button>
        {onReset && (
          <Button variant={ButtonVariant.link} onClick={onReset} data-testid="edit-ipxe-btn">
            {t('ai:Edit configuration')}
          </Button>
        )}
      </ModalBoxFooter>
    </>
  );
};

export default DownloadIpxeScript;
