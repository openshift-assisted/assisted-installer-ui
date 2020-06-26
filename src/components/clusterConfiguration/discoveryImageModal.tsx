import React from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { ToolbarButton } from '../ui/Toolbar';
import { ImageInfo } from '../../api/types';
import DiscoveryImageForm from './DiscoveryImageForm';
import DiscoveryImageSummary from './DiscoveryImageSummary';

type DiscoveryImageModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  imageInfo: ImageInfo;
};

export const DiscoveryImageModalButton: React.FC<DiscoveryImageModalButtonProps> = ({
  ButtonComponent = Button,
  imageInfo,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <ButtonComponent
        variant={ButtonVariant.primary}
        onClick={() => setIsModalOpen(true)}
        id="button-download-discovery-iso"
      >
        Download discovery ISO
      </ButtonComponent>
      {isModalOpen && <DiscoveryImageModal closeModal={closeModal} imageInfo={imageInfo} />}
    </>
  );
};

type DiscoveryImageModalProps = {
  closeModal: () => void;
  imageInfo: ImageInfo;
};

export const DiscoveryImageModal: React.FC<DiscoveryImageModalProps> = ({
  closeModal,
  imageInfo,
}) => {
  const [imageReady, setImageReady] = React.useState(false);
  const { clusterId } = useParams();

  return (
    <Modal
      aria-label="Download discovery ISO dialog"
      title="Download discovery ISO"
      isOpen={true}
      onClose={closeModal}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      {imageReady ? (
        <DiscoveryImageSummary
          clusterId={clusterId}
          onClose={closeModal}
          onReset={() => setImageReady(false)}
        />
      ) : (
        <DiscoveryImageForm
          imageInfo={imageInfo}
          clusterId={clusterId}
          onCancel={closeModal}
          onSuccess={() => setImageReady(true)}
        />
      )}
    </Modal>
  );
};
