import React from 'react';
import { useParams } from 'react-router-dom';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { ToolbarButton } from '../ui/Toolbar';
import { ImageInfo, Cluster } from '../../api/types';
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
      {isModalOpen && <DiscoveryImageModal closeModal={closeModal} initialImageInfo={imageInfo} />}
    </>
  );
};

type DiscoveryImageModalProps = {
  closeModal: () => void;
  initialImageInfo: ImageInfo;
};

export const DiscoveryImageModal: React.FC<DiscoveryImageModalProps> = ({
  closeModal,
  initialImageInfo,
}) => {
  const [imageInfo, setImageInfo] = React.useState<Cluster['imageInfo'] | undefined>();
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
      {imageInfo ? (
        <DiscoveryImageSummary
          clusterId={clusterId}
          imageInfo={imageInfo}
          onClose={closeModal}
          onReset={() => setImageInfo(undefined)}
        />
      ) : (
        <DiscoveryImageForm
          imageInfo={initialImageInfo}
          clusterId={clusterId}
          onCancel={closeModal}
          onSuccess={(imageInfo: Cluster['imageInfo']) => setImageInfo(imageInfo)}
        />
      )}
    </Modal>
  );
};
