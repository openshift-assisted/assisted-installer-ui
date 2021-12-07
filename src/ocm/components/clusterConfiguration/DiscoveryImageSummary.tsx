import React from 'react';
import { Cluster, InfraEnv } from '../../../common';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';

type DiscoveryImageSummaryProps = {
  cluster: Cluster;
  downloadUrl: InfraEnv['downloadUrl'];
  onClose: () => void;
  onReset?: () => void;
};

const DiscoveryImageSummary: React.FC<DiscoveryImageSummaryProps> = ({
  cluster,
  downloadUrl,
  ...restProps
}) => {
  return (
    <DownloadIso
      fileName={`discovery_image_${cluster.name}.iso`}
      downloadUrl={downloadUrl}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
