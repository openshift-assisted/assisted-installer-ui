import React from 'react';
import { Cluster, ErrorState, isSNO } from '../../../common';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';
import useInfraEnvImageUrl from '../../hooks/useInfraEnvImageUrl';

type DiscoveryImageSummaryProps = {
  cluster: Cluster;
  onClose: () => void;
  onReset?: () => void;
};

const DiscoveryImageSummary: React.FC<DiscoveryImageSummaryProps> = ({ cluster, ...restProps }) => {
  const { imageUrl, error } = useInfraEnvImageUrl(cluster.id);
  if (error) {
    return <ErrorState />;
  }

  return (
    <DownloadIso
      fileName={`discovery_image_${cluster.name}.iso`}
      downloadUrl={imageUrl}
      isSNO={isSNO(cluster)}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
