import React from 'react';
import { Cluster, CpuArchitecture } from '../../common';
import { InfraEnvsService } from '../services';

export default function useDay1CpuArchitecture(clusterId: Cluster['id']): CpuArchitecture {
  const [day1CpuArchitecture, setDay1CpuArchitecture] = React.useState<CpuArchitecture>(
    CpuArchitecture.x86,
  );

  const fetchClusterCpuArchitecture = React.useCallback(async () => {
    const cpuArchitecture = await InfraEnvsService.getClusterCpuArchitecture(clusterId);
    setDay1CpuArchitecture(cpuArchitecture);
  }, [clusterId]);

  React.useEffect(() => {
    void fetchClusterCpuArchitecture();
  }, [fetchClusterCpuArchitecture]);

  return day1CpuArchitecture;
}
