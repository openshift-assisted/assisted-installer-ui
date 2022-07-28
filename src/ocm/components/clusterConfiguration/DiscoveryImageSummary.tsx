import React from 'react';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';

type DiscoveryImageSummaryProps = {
  clusterName: string;
  isSNO: boolean;
  isoDownloadUrl: string;
  onClose: () => void;
  onReset: () => void;
};

const DiscoveryImageSummary = ({
  clusterName,
  isSNO,
  isoDownloadUrl,
  ...restProps
}: DiscoveryImageSummaryProps) => {
  return (
    <DownloadIso
      fileName={`discovery_image_${clusterName}.iso`}
      downloadUrl={isoDownloadUrl}
      isSNO={isSNO}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
