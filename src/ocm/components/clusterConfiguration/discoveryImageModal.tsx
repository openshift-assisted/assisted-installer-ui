import React from 'react';
import { Modal, Button, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { Cluster, ErrorState, isSNO, ToolbarButton } from '../../../common';
import DiscoveryImageForm from './DiscoveryImageForm';
import DiscoveryImageSummary from './DiscoveryImageSummary';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { pluralize } from 'humanize-plus';
import useInfraEnvImageUrl from '../../hooks/useInfraEnvImageUrl';

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
  const isSNOCluster = isSNO(cluster);

  return (
    <ButtonComponent
      variant={ButtonVariant.secondary}
      onClick={() => open({ cluster })}
      id={`${idPrefix}-button-download-discovery-iso`}
    >
      Add {pluralize(+isSNOCluster, 'host')}
    </ButtonComponent>
  );
};

export const DiscoveryImageModal: React.FC = () => {
  const [isoDownloadUrl, setIsoDownloadUrl] = React.useState<string>('');
  const [isoDownloadError, setIsoDownloadError] = React.useState<string>('');

  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;
  const { getImageUrl } = useInfraEnvImageUrl();

  const onImageReady = React.useCallback(async () => {
    const { url, error } = await getImageUrl(cluster.id);
    setIsoDownloadUrl(url);
    setIsoDownloadError(error);
  }, [getImageUrl, cluster?.id]);

  const onReset = React.useCallback(() => {
    setIsoDownloadUrl('');
  }, []);

  if (!cluster) {
    return null;
  }

  const isSNOCluster = isSNO(cluster);

  return (
    <Modal
      aria-label="Add hosts dialog"
      title={`Add ${pluralize(+isSNOCluster, 'host')}`}
      isOpen={isOpen}
      onClose={close}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="generate-discovery-iso-modal"
    >
      {isoDownloadError && <ErrorState />}
      {isoDownloadUrl ? (
        <DiscoveryImageSummary
          clusterName={cluster.name || ''}
          isSNO={isSNOCluster}
          onClose={close}
          onReset={onReset}
          isoDownloadUrl={isoDownloadUrl}
        />
      ) : (
        <DiscoveryImageForm cluster={cluster} onCancel={close} onSuccess={onImageReady} />
      )}
    </Modal>
  );
};
