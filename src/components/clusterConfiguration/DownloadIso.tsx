import React from 'react';
import { saveAs } from 'file-saver';
import {
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
  TextContent,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { DetailList, DetailItem } from '../ui/DetailList';

export type DownloadISOProps = {
  fileName: string;
  downloadUrl: string;
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
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>Discovery ISO URL</DescriptionListTerm>
            <DescriptionListDescription>
              <ClipboardCopy isReadOnly onCopy={(event) => clipboardCopyFunc(event, downloadUrl)}>
                {downloadUrl}
              </ClipboardCopy>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Command to download the ISO</DescriptionListTerm>
            <DescriptionListDescription>
              <ClipboardCopy isReadOnly onCopy={(event) => clipboardCopyFunc(event, wgetCommand)}>
                {wgetCommand}
              </ClipboardCopy>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Boot instructions</DescriptionListTerm>
            <DescriptionListDescription>
              Use a bootable device (local disk, USB drive, etc.) or network booting (PXE) to boot
              each host <b>once</b> from the Discovery ISO.
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          variant={ButtonVariant.primary}
          onClick={() => saveAs(downloadUrl)}
          data-testid="download-iso-btn"
        >
          Download Discovery ISO
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onClose} data-testid="close-iso-btn">
          Close
        </Button>
        {onReset && (
          <Button variant={ButtonVariant.link} onClick={onReset} data-testid="edit-iso-btn">
            Edit ISO Configuration
          </Button>
        )}
      </ModalBoxFooter>
    </>
  );
};

export default DownloadIso;
