import React from 'react';
import { Cluster, ErrorState, LoadingState } from '../../../common';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';
import useInfraEnvImageUrl from '../../hooks/useInfraEnvImageUrl';

type DiscoveryImageSummaryProps = {
  cluster: Cluster;
  onClose: () => void;
  onReset?: () => void;
};

const DiscoveryImageSummary: React.FC<DiscoveryImageSummaryProps> = ({ cluster, ...restProps }) => {
  const { imageUrl, error, isLoading } = useInfraEnvImageUrl(cluster.id);
  if (error) {
    return <ErrorState />;
  }
  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <DownloadIso
      fileName={`discovery_image_${cluster.name}.iso`}
      downloadUrl={imageUrl}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
