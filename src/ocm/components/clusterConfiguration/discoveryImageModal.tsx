import React from 'react';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { Cluster, ToolbarButton } from '../../../common';
import DiscoveryImageForm from './DiscoveryImageForm';
import DiscoveryImageSummary from './DiscoveryImageSummary';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';

type DiscoveryImageModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  cluster: Cluster;
  idPrefix: string;
};

export const DiscoveryImageModalButton: React.FC<DiscoveryImageModalButtonProps> = ({
  ButtonComponent = Button,
  cluster,
  idPrefix,
}) => {
  const { discoveryImageDialog } = useModalDialogsContext();
  const { open } = discoveryImageDialog;

  return (
    <>
      <ButtonComponent
        variant={ButtonVariant.secondary}
        onClick={() => open({ cluster })}
        id={`${idPrefix}-button-download-discovery-iso`}
      >
        Add hosts
      </ButtonComponent>
    </>
  );
};

export const DiscoveryImageModal: React.FC = () => {
  const [showSummary, setShowSummary] = React.useState<boolean>(false);

  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;

  if (!cluster) {
    return null;
  }

  return (
    <Modal
      aria-label="Add hosts dialog"
      title="Add hosts"
      isOpen={isOpen}
      onClose={close}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="generate-discovery-iso-modal"
    >
      {showSummary ? (
        <DiscoveryImageSummary
          cluster={cluster}
          onClose={close}
          onReset={() => setShowSummary(false)}
        />
      ) : (
        <DiscoveryImageForm
          cluster={cluster}
          onCancel={close}
          onSuccess={() => setShowSummary(true)}
        />
      )}
    </Modal>
  );
};
