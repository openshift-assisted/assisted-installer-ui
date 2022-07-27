import React from 'react';
import { Cluster, isSNO } from '../../../common';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';

type DiscoveryImageSummaryProps = {
  cluster: Cluster;
  isoDownloadUrl: string;
  onClose: () => void;
  onReset: () => void;
};

const DiscoveryImageSummary = ({
  cluster,
  isoDownloadUrl,
  ...restProps
}: DiscoveryImageSummaryProps) => {
  return (
    <DownloadIso
      fileName={`discovery_image_${cluster.name || ''}.iso`}
      downloadUrl={isoDownloadUrl}
      isSNO={isSNO(cluster)}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
