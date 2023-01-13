import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { pluralize } from 'humanize-plus';
import {
  Cluster,
  CpuArchitecture,
  DownloadIso,
  ErrorState,
  isSNO,
  ToolbarButton,
} from '../../../common';
import DiscoveryImageForm from './DiscoveryImageForm';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import useInfraEnvImageUrl from '../../hooks/useInfraEnvImageUrl';
import useInfraEnvIpxeImageUrl from '../../hooks/useInfraEnvIpxeImageUrl';
import DownloadIpxeScript from '../../../common/components/clusterConfiguration/DownloadIpxeScript';

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
  const [ipxeDownloadUrl, setIpxeDownloadUrl] = React.useState<string>('');
  const [ipxeDownloadError, setIpxeDownloadError] = React.useState<string>('');
  const [isIpxeSelected, setIpxeSelected] = React.useState<boolean>(false);

  const { discoveryImageDialog } = useModalDialogsContext();
  const { data, isOpen, close } = discoveryImageDialog;
  const cluster = data?.cluster;
  const { getIsoImageUrl } = useInfraEnvImageUrl();
  const { getIpxeImageUrl } = useInfraEnvIpxeImageUrl();

  const onImageReady = React.useCallback(async () => {
    // We need to retrieve the Iso for the only infraEnv on Day1, hence we don't specify the architecture
    const { url, error } = await getIsoImageUrl(cluster.id, CpuArchitecture.USE_DAY1_ARCHITECTURE);
    setIsoDownloadUrl(url);
    setIsoDownloadError(error);
  }, [getIsoImageUrl, cluster?.id]);

  const onImageIpxeReady = React.useCallback(async () => {
    // We need to retrieve the Iso for the only infraEnv on Day1, hence we don't specify the architecture
    const { url, error } = await getIpxeImageUrl(cluster.id, CpuArchitecture.USE_DAY1_ARCHITECTURE);
    setIpxeDownloadUrl(url);
    setIpxeDownloadError(error);
  }, [getIpxeImageUrl, cluster?.id]);

  const onReset = React.useCallback(() => {
    setIsoDownloadUrl('');
    setIpxeSelected(false);
  }, []);

  const onResetIpxe = React.useCallback(() => {
    setIpxeDownloadUrl('');
    setIpxeSelected(true);
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
      {(isoDownloadError || ipxeDownloadError) && <ErrorState />}
      {isoDownloadUrl ? (
        <DownloadIso
          fileName={`discovery_image_${cluster.name || ''}.iso`}
          downloadUrl={isoDownloadUrl}
          isSNO={isSNOCluster}
          onReset={onReset}
          onClose={close}
        />
      ) : ipxeDownloadUrl ? (
        <DownloadIpxeScript
          fileName={`discovery_ipxe_script_${cluster.name || ''}.txt`}
          downloadUrl={ipxeDownloadUrl}
          isSNO={isSNOCluster}
          onReset={onResetIpxe}
          onClose={close}
        />
      ) : (
        <DiscoveryImageForm
          cluster={cluster}
          onCancel={close}
          onSuccess={onImageReady}
          cpuArchitecture={CpuArchitecture.USE_DAY1_ARCHITECTURE}
          onSuccessIpxe={onImageIpxeReady}
          isIpxeSelected={isIpxeSelected}
        />
      )}
    </Modal>
  );
};
