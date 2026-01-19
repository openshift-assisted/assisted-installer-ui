import React from 'react';
import DownloadIso, { DownloadISOProps } from './DownloadIso';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Modal, ModalHeader, ModalVariant } from '@patternfly/react-core';

type DownloadIsoModalProps = DownloadISOProps & {
  isOpen: boolean;
};

const DownloadIsoModal: React.FC<DownloadIsoModalProps> = ({ isOpen, ...props }) => {
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Download host discovery ISO dialog')}
      isOpen={isOpen}
      onClose={props.onClose}
      variant={ModalVariant.small}
      id="download-discovery-iso-modal"
    >
      <ModalHeader title={t('ai:Add host')} />
      <DownloadIso {...props} />
    </Modal>
  );
};

export default DownloadIsoModal;
