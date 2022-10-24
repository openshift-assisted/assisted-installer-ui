import { InfraEnvsService } from '.';
import { ClustersAPI } from './apis';
import { Cluster, CpuArchitecture, SupportedCpuArchitectures } from '../../common';
import { OcmClusterType } from '../components/AddHosts/types';

const OCM_DISCOVERED_HOSTS_ARCH_x86 = 'amd64';
const OCM_DISCOVERED_HOSTS_ARCH_ARM = 'arm64';
const OCM_DISCOVERED_HOSTS_ARCH_MULTI = 'multi';

// OCM's "arch" field is based on the hosts that have been discovered to this moment
export const getDefaultOcmCpuArchitecture = (ocmArch: string): CpuArchitecture => {
  switch (ocmArch) {
    case OCM_DISCOVERED_HOSTS_ARCH_x86:
      return CpuArchitecture.x86;
    case OCM_DISCOVERED_HOSTS_ARCH_ARM:
      return CpuArchitecture.ARM;
    case OCM_DISCOVERED_HOSTS_ARCH_MULTI:
      return CpuArchitecture.x86;
    default:
      throw new Error(`Unknown OCM CPU architecture: ${ocmArch}`);
  }
};

export const getDefaultDay1CpuArchitecture = (
  cpuArchitecture: CpuArchitecture,
): CpuArchitecture => {
  switch (cpuArchitecture) {
    case CpuArchitecture.ARM:
      return CpuArchitecture.ARM;
    case CpuArchitecture.DAY1_CLUSTER_USES_MULTI:
    default:
      // For multi, set default selection to x86, although they can choose the other architectures too
      return CpuArchitecture.x86;
  }
};

const Day2ClusterService = {
  getOpenshiftClusterId(ocmCluster?: OcmClusterType) {
    return ocmCluster && ocmCluster.external_id;
  },

  async fetchCluster(
    ocmCluster: OcmClusterType,
    pullSecret: string,
    openshiftVersion: string,
    isMultiArch: boolean,
  ) {
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);

    if (!openshiftClusterId) {
      // error?
      return;
    }

    let apiVipDnsname = '';
    // Format of cluster.api.url: protocol://domain:port
    if (ocmCluster.api?.url) {
      const apiVipUrl = new URL(ocmCluster.api.url);
      apiVipDnsname = apiVipUrl.hostname; // just domain is needed
    } else if (ocmCluster.console?.url) {
      // Try to guess API URL from Console URL.
      // Assumption: the cluster is originated by Assisted Installer, so console URL format should be of a fixed format.
      // protocol://console-openshift-console.apps.[CLUSTER_NAME].[BASE_DOMAIN]"
      const consoleUrlHostname = new URL(ocmCluster.console.url).hostname;
      const APPS = '.apps.';
      apiVipDnsname =
        'api.' + consoleUrlHostname.substring(consoleUrlHostname.indexOf(APPS) + APPS.length);
    }

    const day2ClusterId = await Day2ClusterService.getDay2ClusterId(openshiftClusterId);
    if (day2ClusterId) {
      return Day2ClusterService.fetchClusterById(day2ClusterId);
    } else {
      const cpuArchitectures = isMultiArch
        ? SupportedCpuArchitectures
        : [getDefaultOcmCpuArchitecture(ocmCluster.cpu_architecture)];
      return Day2ClusterService.createCluster(
        openshiftClusterId,
        ocmCluster.display_name || ocmCluster.name || openshiftClusterId,
        apiVipDnsname,
        pullSecret,
        openshiftVersion,
        cpuArchitectures,
      );
    }
  },

  async fetchClusterById(clusterId: Cluster['id']) {
    const { data } = await ClustersAPI.get(clusterId);
    return data;
  },

  async getDay2ClusterId(openshiftClusterId: OcmClusterType['external_id']) {
    const { data: clusters } = await ClustersAPI.listByOpenshiftId(openshiftClusterId);
    const day2Clusters = clusters.filter((cluster) => cluster.kind === 'AddHostsCluster');
    if (day2Clusters.length > 0) {
      return day2Clusters[0].id;
    }
    return undefined;
  },

  async createCluster(
    openshiftClusterId: OcmClusterType['external_id'],
    clusterName: string,
    apiVipDnsname: string,
    pullSecret: string,
    openshiftVersion: string,
    cpuArchitectures: CpuArchitecture[],
  ) {
    const { data: day2Cluster } = await ClustersAPI.registerAddHosts({
      openshiftClusterId, // used to both match OpenShift Cluster and as an assisted-installer ID
      name: `scale-up-${clusterName}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
      apiVipDnsname,
      openshiftVersion,
    });

    // Create the infraEnvs for each cpuArchitecture
    const infraEnvsToCreate = cpuArchitectures.map((cpuArchitecture) => {
      return InfraEnvsService.create({
        name: `${day2Cluster.name || ''}_infra-env-${cpuArchitecture}`,
        pullSecret,
        clusterId: day2Cluster.id,
        openshiftVersion,
        cpuArchitecture,
      });
    });
    await Promise.all(infraEnvsToCreate);

    return day2Cluster;
  },

  /**
   * Complete the day2Cluster coming from AI polling with the data in the OCM cluster
   * @param day2Cluster Day2 cluster
   * @param ocmCluster OCM cluster
   */
  mapOcmClusterToAssistedCluster: (
    day2Cluster: Cluster | undefined,
    ocmCluster: OcmClusterType | undefined,
  ) => {
    if (!ocmCluster || !day2Cluster) {
      return day2Cluster;
    }
    return {
      ...day2Cluster,
      openshiftVersion: ocmCluster.openshift_version,
      cpuArchitecture: getDefaultOcmCpuArchitecture(ocmCluster.cpu_architecture),
    };
  },
};

export default Day2ClusterService;
