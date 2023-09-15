import { InfraEnvsService } from '.';
import { ClustersAPI } from './apis';
import { CpuArchitecture, SupportedCpuArchitecture } from '../../common';
import { OcmClusterType } from '../components/AddHosts/types';
import { mapOcmArchToCpuArchitecture } from './CpuArchitectureService';
import {
  Cluster,
  Platform,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';

export const getApiVipDnsName = (ocmCluster: OcmClusterType) => {
  let apiVipDnsname = '';
  let urlType = '';
  try {
    // Format of cluster.api.url: protocol://domain:port
    if (ocmCluster.api?.url) {
      urlType = 'api';
      const apiVipUrl = new URL(ocmCluster.api.url);
      apiVipDnsname = apiVipUrl.hostname; // just domain is needed
    } else if (ocmCluster.console?.url) {
      urlType = 'console';
      // Try to guess API URL from Console URL.
      // Assumption: the cluster is originated by Assisted Installer, so console URL format should be of a fixed format.
      // protocol://console-openshift-console.apps.[CLUSTER_NAME].[BASE_DOMAIN]"
      const consoleUrlHostname = new URL(ocmCluster.console.url).hostname;
      const APPS = '.apps.';
      apiVipDnsname =
        'api.' + consoleUrlHostname.substring(consoleUrlHostname.indexOf(APPS) + APPS.length);
    }
  } catch (e) {
    // can be ignored, the error type has been set already
  }
  return { apiVipDnsname, errorType: apiVipDnsname ? '' : urlType };
};

export const mapCloudProviderToPlatformType = (
  cloud_provider: { kind: string; id: string } | undefined,
) => {
  const platformType = cloud_provider?.id === 'external' ? 'oci' : cloud_provider?.id;
  const platform: Platform = {
    type: (platformType as PlatformType) || 'baremetal',
  };
  return platform;
};

const Day2ClusterService = {
  getOpenshiftClusterId(ocmCluster?: OcmClusterType) {
    return ocmCluster && ocmCluster.external_id;
  },

  async fetchCluster(ocmCluster: OcmClusterType, pullSecret: string, openshiftVersion: string) {
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);

    if (!openshiftClusterId) {
      // error?
      return;
    }

    const day2ClusterId = await Day2ClusterService.getDay2ClusterId(openshiftClusterId);
    if (day2ClusterId) {
      return Day2ClusterService.fetchClusterById(day2ClusterId);
    }

    return Day2ClusterService.createCluster(
      openshiftClusterId,
      ocmCluster.display_name || ocmCluster.name || openshiftClusterId,
      getApiVipDnsName(ocmCluster).apiVipDnsname,
      pullSecret,
      openshiftVersion,
      mapOcmArchToCpuArchitecture(ocmCluster.cpu_architecture) || CpuArchitecture.x86,
    );
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
    cpuArchitecture: SupportedCpuArchitecture,
  ) {
    const { data: day2Cluster } = await ClustersAPI.registerAddHosts({
      openshiftClusterId, // used to both match OpenShift Cluster and as an assisted-installer ID
      name: `scale-up-${clusterName}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
      apiVipDnsname,
      openshiftVersion,
    });

    // Create only the infraenv for the day1 cpu architecture
    await InfraEnvsService.create({
      name: InfraEnvsService.makeInfraEnvName(cpuArchitecture, day2Cluster.name),
      pullSecret,
      clusterId: day2Cluster.id,
      openshiftVersion,
      cpuArchitecture,
    });

    return day2Cluster;
  },

  /**
   * Complete the day2Cluster coming from AI polling with the data in the OCM cluster
   * @param day2Cluster Day2 cluster
   * @param ocmCluster OCM cluster
   */
  completeAiClusterWithOcmCluster: (
    day2Cluster: Cluster | undefined,
    ocmCluster: OcmClusterType | undefined,
  ): Cluster | undefined => {
    let treakedCluster = day2Cluster;

    if (ocmCluster && day2Cluster) {
      treakedCluster = {
        ...day2Cluster,
        openshiftVersion: ocmCluster.openshift_version,
        // The field "cpu_architecture" is calculated based on the existing hosts' architecture
        // It can be a specific architecture, or "multi" if hosts from several architectures have been discovered
        cpuArchitecture: mapOcmArchToCpuArchitecture(ocmCluster.cpu_architecture),
        platform: mapCloudProviderToPlatformType(ocmCluster.cloud_provider),
      };
    }
    return treakedCluster;
  },
};

export default Day2ClusterService;
