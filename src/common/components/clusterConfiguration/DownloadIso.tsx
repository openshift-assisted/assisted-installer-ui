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
} from '@patternfly/react-core';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { DetailItem, DetailList } from '../ui';
import DiscoveryInstructions from './DiscoveryInstructions';

export type DownloadISOProps = {
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
}) => {
  const wgetCommand = `wget -O ${fileName} '${downloadUrl}'`;

  return (
    <>
      <ModalBoxBody>
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon icon={CheckCircleIcon} color={successColor.value} />
          <Title headingLevel="h4" size="lg">
            Discovery ISO is ready to download
          </Title>
        </EmptyState>
        <DiscoveryInstructions />
        <DetailList>
          <DetailItem
            title="Discovery ISO URL"
            value={
              <ClipboardCopy isReadOnly onCopy={(event) => clipboardCopyFunc(event, downloadUrl)}>
                {downloadUrl}
              </ClipboardCopy>
            }
          />
          <DetailItem
            title="Command to download the ISO:"
            value={
              <ClipboardCopy isReadOnly onCopy={(event) => clipboardCopyFunc(event, wgetCommand)}>
                {wgetCommand}
              </ClipboardCopy>
            }
          />
          <DetailItem
            title="Boot instructions"
            value={
              <>
                Use a bootable device (local disk, USB drive, etc.) or network booting (PXE) to boot
                each host <b>once</b> from the Discovery ISO.
              </>
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
