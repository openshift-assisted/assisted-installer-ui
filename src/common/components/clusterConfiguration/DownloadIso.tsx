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
} from '@patternfly/react-core';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { DetailItem, DetailList } from '../ui';
import DiscoveryInstructions from './DiscoveryInstructions';
import { StaticIPInfo } from './DiscoveryImageConfigForm';

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

  return (
    <>
      <ModalBoxBody>
        <Stack hasGutter>
          {hasDHCP === false && (
            <StackItem>
              <StaticIPInfo />
            </StackItem>
          )}
          <StackItem>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={CheckCircleIcon} color={successColor.value} />
              <Title headingLevel="h4" size="lg">
                Discovery ISO is ready to download
              </Title>
            </EmptyState>
            <DiscoveryInstructions isSNO={isSNO} />
            <DetailList>
              <DetailItem
                title="Discovery ISO URL"
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
                title="Command to download the ISO:"
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
                'Never share your downloaded ISO with anyone else. ' +
                'Forwarding it could put your credentials and personal data at risk.'
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
          Download Discovery ISO
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onClose} data-testid="close-iso-btn">
          Close
        </Button>
        {onReset && (
          <Button variant={ButtonVariant.link} onClick={onReset} data-testid="edit-iso-btn">
            Edit ISO configuration
          </Button>
        )}
      </ModalBoxFooter>
    </>
  );
};

export default DownloadIso;
