import { CpuArchitecture, getClusterDetailsInitialValues } from '../../../common';
import { Cluster, ManagedDomain } from '../../../common/api/types';
import { OpenshiftVersionOptionType } from '../../../common/types';
import { OcmClusterDetailsValues } from '../../api/types';

export const getOcmClusterDetailsInitialValues = ({
  cluster,
  ...args
}: {
  cluster?: Cluster;
  pullSecret?: string;
  managedDomains: ManagedDomain[];
  ocpVersions: OpenshiftVersionOptionType[];
  baseDomain?: string;
}): OcmClusterDetailsValues => {
  const values = getClusterDetailsInitialValues({
    cluster,
    ...args,
  });
  const cpuArchitecture = cluster?.cpuArchitecture || CpuArchitecture.x86;
  return { ...values, cpuArchitecture: cpuArchitecture };
};
