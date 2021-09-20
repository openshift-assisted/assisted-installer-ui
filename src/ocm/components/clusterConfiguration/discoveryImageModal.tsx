import React from 'react';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { Cluster, InfraEnv, ToolbarButton } from '../../../common';
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
        Generate Discovery ISO
      </ButtonComponent>
    </>
  );
};

export const DiscoveryImageModal: React.FC = () => {
  const [downloadUrl, setDownloadUrl] = React.useState<InfraEnv['downloadUrl'] | undefined>();
  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;

  if (!cluster) {
    return null;
  }

  return (
    <Modal
      aria-label="Generate Discovery ISO dialog"
      title="Generate Discovery ISO"
      isOpen={isOpen}
      onClose={close}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="generate-discovery-iso-modal"
    >
      {downloadUrl ? (
        <DiscoveryImageSummary
          cluster={cluster}
          downloadUrl={downloadUrl}
          onClose={close}
          onReset={() => setDownloadUrl(undefined)}
        />
      ) : (
        <DiscoveryImageForm
          cluster={cluster}
          onCancel={close}
          onSuccess={(downloadUrl: InfraEnv['downloadUrl']) => setDownloadUrl(downloadUrl)}
        />
      )}
    </Modal>
  );
};
