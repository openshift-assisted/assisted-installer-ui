import {
  Cluster,
  CpuArchitecture,
  OcmCpuArchitecture,
  getDefaultCpuArchitecture,
} from '../../common';

const mapOcmArchToCpuArchitecture = (ocmArch: OcmCpuArchitecture | string): CpuArchitecture => {
  switch (ocmArch) {
    case OcmCpuArchitecture.x86:
      return CpuArchitecture.x86;
    case OcmCpuArchitecture.ARM:
      return CpuArchitecture.ARM;
    case OcmCpuArchitecture.MULTI:
      return getDefaultCpuArchitecture();
    default:
      throw new Error(`Unknown OCM CPU architecture: ${ocmArch}`);
  }
};

/**
 * Takes the cluster.cpuArchitecture value and maps it to
 * a valid infraEnv cpuArchitecture value (currently either x86 or AMD).
 *
 * As of 2022-10-27, cluster's cpuArchitecture can be:
 * - For an AI cluster: CpuArchitecture.x86, CpuArchitecture.ARM or the value "multi"
 * - For an OCM cluster: values as defined in OcmCpuArchitecture
 *
 * @param clusterCpuArchitecture the cluster's cpuArchitecture value
 */
const mapClusterCpuArchToInfraEnvCpuArch = (
  clusterCpuArchitecture: Cluster['cpuArchitecture'] | OcmCpuArchitecture,
): CpuArchitecture => {
  switch (clusterCpuArchitecture) {
    case CpuArchitecture.ARM:
    case OcmCpuArchitecture.ARM:
      return CpuArchitecture.ARM;

    case CpuArchitecture.x86:
    case OcmCpuArchitecture.x86:
      return CpuArchitecture.x86;
    case CpuArchitecture.MULTI:
    case OcmCpuArchitecture.MULTI:
    default:
      // For multi, use default selection, although they can choose the other architectures too
      return getDefaultCpuArchitecture();
  }
};

export {
  mapOcmArchToCpuArchitecture,
  mapClusterCpuArchToInfraEnvCpuArch,
  getDefaultCpuArchitecture,
};
