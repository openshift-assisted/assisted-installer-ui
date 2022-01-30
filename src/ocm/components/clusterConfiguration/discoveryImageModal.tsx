import React from 'react';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { Cluster, InfraEnv, InfraEnvImageUrl, ToolbarButton } from '../../../common';
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
  const [downloadUrl, setdownloadUrl] = React.useState<InfraEnv['downloadUrl'] | undefined>();
  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;

  if (!cluster) {
    return null;
  }

  const onReset = () => setdownloadUrl(undefined);
  const onClose = () => {
    onReset();
    close();
  };

  return (
    <Modal
      aria-label="Add hosts dialog"
      title="Add hosts"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="generate-discovery-iso-modal"
    >
      {downloadUrl ? (
        <DiscoveryImageSummary
          cluster={cluster}
          downloadUrl={downloadUrl}
          onClose={onClose}
          onReset={onReset}
        />
      ) : (
        <DiscoveryImageForm
          cluster={cluster}
          onCancel={onClose}
          onSuccess={(downloadUrl: InfraEnvImageUrl['url']) => setdownloadUrl(downloadUrl)}
        />
      )}
    </Modal>
  );
};
