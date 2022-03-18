import React from 'react';
import { Cluster, ErrorState, isSNO, LoadingState } from '../../../common';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';
import useInfraEnvImageUrl from '../../hooks/useInfraEnvImageUrl';

type DiscoveryImageSummaryProps = {
  cluster: Cluster;
  onClose: () => void;
  onReset?: () => void;
};

const DiscoveryImageSummary: React.FC<DiscoveryImageSummaryProps> = ({ cluster, ...restProps }) => {
  const { imageUrl, infraEnvId, error, isLoading } = useInfraEnvImageUrl(cluster.id);

  if (error) {
    return <ErrorState />;
  }
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <DownloadIso
      fileName={infraEnvId && `${infraEnvId}-discovery.iso`}
      downloadUrl={imageUrl}
      isSNO={isSNO(cluster)}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
