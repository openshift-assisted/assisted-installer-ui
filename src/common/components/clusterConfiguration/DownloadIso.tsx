import React from 'react';
import { saveAs } from 'file-saver';
import {
  Alert,
  Button,
  ButtonVariant,
  ClipboardCopy,
  clipboardCopyFunc,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  ModalBoxBody,
  ModalBoxFooter,
  Stack,
  StackItem,
  AlertVariant,
} from '@patternfly/react-core';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
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

const DownloadIso: React.FC<DownloadISOProps> = ({
  fileName = 'discovery.iso',
  downloadUrl,
  onClose,
  onReset,
  hasDHCP,
  isSNO = false,
}) => {
  const wgetCommand = `wget -O ${fileName} '${downloadUrl}'`;
  const { t } = useTranslation();
  return (
    <>
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            <Alert isInline variant="success" title={'Discovery ISO is ready for download'}>
              <>
                &nbsp;
                <DiscoveryInstructions isSNO={isSNO} />
              </>
            </Alert>
          </StackItem>
          <StackItem>
            <Alert
              variant={AlertVariant.info}
              isInline
              title={
                'Never share your downloaded ISO with anyone else. Forwarding it could put your credentials and personal data at risk.'
              }
            />
          </StackItem>
          {hasDHCP === false && (
            <StackItem>
              <StaticIPInfo />
            </StackItem>
          )}
          <StackItem>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={CheckCircleIcon} color={successColor.value} />
              <Title headingLevel="h4" size="lg">
                {t('ai:Discovery ISO is ready to download')}
              </Title>
            </EmptyState>
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
              title={
                t('ai:Never share your downloaded ISO with anyone else. ') +
                t('ai:Forwarding it could put your credentials and personal data at risk.')
              }
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
