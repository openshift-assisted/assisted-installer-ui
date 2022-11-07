import React from 'react';
import DownloadIso from '../../../common/components/clusterConfiguration/DownloadIso';
import { CpuArchitecture } from '../../../common';

type DiscoveryImageSummaryProps = {
  clusterName: string;
  isSNO: boolean;
  isoDownloadUrl: string;
  onClose: () => void;
  onReset: () => void;
  cpuArchitecture: CpuArchitecture;
};

const DiscoveryImageSummary = ({
  clusterName,
  isSNO,
  isoDownloadUrl,
  cpuArchitecture,
  ...restProps
}: DiscoveryImageSummaryProps) => {
  const nameSuffix =
    cpuArchitecture === CpuArchitecture.USE_DAY1_ARCHITECTURE
      ? clusterName
      : `${clusterName}_${cpuArchitecture}`;
  return (
    <DownloadIso
      fileName={`discovery_image_${nameSuffix}.iso`}
      downloadUrl={isoDownloadUrl}
      isSNO={isSNO}
      {...restProps}
    />
  );
};

export default DiscoveryImageSummary;
