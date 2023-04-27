import {
  Cluster,
  CpuArchitecture,
  OcmCpuArchitecture,
  getDefaultCpuArchitecture,
  SupportedCpuArchitecture,
} from '../../common';

const mapOcmArchToCpuArchitecture = (
  ocmArch: OcmCpuArchitecture | string,
): Exclude<CpuArchitecture, CpuArchitecture.USE_DAY1_ARCHITECTURE> | undefined => {
  switch (ocmArch) {
    case OcmCpuArchitecture.x86:
      return CpuArchitecture.x86;
    case OcmCpuArchitecture.ARM:
      return CpuArchitecture.ARM;
    case OcmCpuArchitecture.ppc64le:
      return CpuArchitecture.ppc64le;
    case OcmCpuArchitecture.s390x:
      return CpuArchitecture.s390x;
    case OcmCpuArchitecture.MULTI:
      return getDefaultCpuArchitecture();
    default:
      return undefined;
  }
};

/**
 * Takes the cluster.cpuArchitecture value and maps it to
 * a valid infraEnv cpuArchitecture value .
 *
 * @param clusterCpuArchitecture the cluster's cpuArchitecture value
 */
const mapClusterCpuArchToInfraEnvCpuArch = (
  clusterCpuArchitecture: Cluster['cpuArchitecture'] | OcmCpuArchitecture,
): SupportedCpuArchitecture => {
  switch (clusterCpuArchitecture) {
    case CpuArchitecture.ARM:
    case OcmCpuArchitecture.ARM:
      return CpuArchitecture.ARM;
    case CpuArchitecture.x86:
    case OcmCpuArchitecture.x86:
      return CpuArchitecture.x86;
    case CpuArchitecture.ppc64le:
    case OcmCpuArchitecture.ppc64le:
      return CpuArchitecture.ppc64le;
    case CpuArchitecture.s390x:
    case OcmCpuArchitecture.s390x:
      return CpuArchitecture.s390x;
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
