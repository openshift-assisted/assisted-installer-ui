import React from 'react';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { ToolbarButton } from '../ui/Toolbar';
import { Cluster } from '../../api/types';
import DiscoveryImageForm from './DiscoveryImageForm';
import DiscoveryImageSummary from './DiscoveryImageSummary';

type DiscoveryImageModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  cluster: Cluster;
};

export const DiscoveryImageModalButton: React.FC<DiscoveryImageModalButtonProps> = ({
  ButtonComponent = Button,
  cluster,
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
        Generate Discovery ISO
      </ButtonComponent>
      {isModalOpen && <DiscoveryImageModal closeModal={closeModal} cluster={cluster} />}
    </>
  );
};

type DiscoveryImageModalProps = {
  closeModal: () => void;
  cluster: Cluster;
};

const DiscoveryImageModal: React.FC<DiscoveryImageModalProps> = ({ closeModal, cluster }) => {
  const [imageInfo, setImageInfo] = React.useState<Cluster['imageInfo'] | undefined>();

  return (
    <Modal
      aria-label="Generate Discovery ISO dialog"
      title="Generate Discovery ISO"
      isOpen={true}
      onClose={closeModal}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      {imageInfo ? (
        <DiscoveryImageSummary
          cluster={cluster}
          imageInfo={imageInfo}
          onClose={closeModal}
          onReset={() => setImageInfo(undefined)}
        />
      ) : (
        <DiscoveryImageForm
          cluster={cluster}
          onCancel={closeModal}
          onSuccess={(imageInfo: Cluster['imageInfo']) => setImageInfo(imageInfo)}
        />
      )}
    </Modal>
  );
};
