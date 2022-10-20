import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { pluralize } from 'humanize-plus';
import { Cluster, CpuArchitecture, ErrorState, isSNO, ToolbarButton } from '../../../common';
import DiscoveryImageForm from './DiscoveryImageForm';
import DiscoveryImageSummary from './DiscoveryImageSummary';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
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

export const DiscoveryImageModal = () => {
  const [isoDownloadUrl, setIsoDownloadUrl] = React.useState<string>('');
  const [isoDownloadError, setIsoDownloadError] = React.useState<string>('');

  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;
  const { getIsoImageUrl } = useInfraEnvImageUrl();

  const onImageReady = React.useCallback(async () => {
    // We need to retrieve the Iso for the only infraEnv on Day1, hence we don't specify the architecture
    const { url, error } = await getIsoImageUrl(cluster.id, CpuArchitecture.USE_DAY1_ARCHITECTURE);
    setIsoDownloadUrl(url);
    setIsoDownloadError(error);
  }, [getIsoImageUrl, cluster?.id]);

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
