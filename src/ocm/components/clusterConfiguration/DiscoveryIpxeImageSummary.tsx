import React from 'react';
import DownloadIpxeScript from '../../../common/components/clusterConfiguration/DownloadIpxeScript';
import { CpuArchitecture } from '../../../common';

type DiscoveryIpxeImageSummaryProps = {
  clusterName: string;
  isSNO: boolean;
  ipxeDownloadUrl: string;
  onClose: () => void;
  onReset: () => void;
  cpuArchitecture: CpuArchitecture;
};

const DiscoveryIpxeImageSummary = ({
  clusterName,
  isSNO,
  ipxeDownloadUrl,
  cpuArchitecture,
  ...restProps
}: DiscoveryIpxeImageSummaryProps) => {
  const nameSuffix =
    cpuArchitecture === CpuArchitecture.USE_DAY1_ARCHITECTURE
      ? clusterName
      : `${clusterName}_${cpuArchitecture}`;
  return (
    <DownloadIpxeScript
      fileName={`discovery_ipxe_script_${nameSuffix}.txt`}
      downloadUrl={ipxeDownloadUrl}
      isSNO={isSNO}
      {...restProps}
    />
  );
};

export default DiscoveryIpxeImageSummary;
