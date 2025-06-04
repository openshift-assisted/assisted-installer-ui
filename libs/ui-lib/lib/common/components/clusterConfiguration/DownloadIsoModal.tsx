import React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import DownloadIso, { DownloadISOProps } from './DownloadIso';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type DownloadIsoModalProps = DownloadISOProps & {
  isOpen: boolean;
};

const DownloadIsoModal: React.FC<DownloadIsoModalProps> = ({ isOpen, ...props }) => {
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Download host discovery ISO dialog')}
      title={t('ai:Add host')}
      isOpen={isOpen}
      onClose={props.onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="download-discovery-iso-modal"
    >
      <DownloadIso {...props} />
    </Modal>
  );
};

export default DownloadIsoModal;
