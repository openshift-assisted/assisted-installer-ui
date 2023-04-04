import { InfraEnvsService } from '.';
import { ClustersAPI } from './apis';
import {
  ArchitectureSupportLevelId,
  Cluster,
  ClusterCpuArchitecture,
  getSupportedCpuArchitectures,
  OcmCpuArchitecture,
  SupportedCpuArchitecture,
  SupportLevel,
} from '../../common';
import { OcmClusterType } from '../components/AddHosts/types';
import { mapOcmArchToCpuArchitecture } from './CpuArchitectureService';

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

const Day2ClusterService = {
  getOpenshiftClusterId(ocmCluster?: OcmClusterType) {
    return ocmCluster && ocmCluster.external_id;
  },

  async fetchCluster(
    ocmCluster: OcmClusterType,
    pullSecret: string,
    openshiftVersion: string,
    supportedCpuArchitectures: Record<ArchitectureSupportLevelId, SupportLevel> | null,
    canSelectCpuArch?: boolean,
  ) {
    const openshiftClusterId = Day2ClusterService.getOpenshiftClusterId(ocmCluster);

    if (!openshiftClusterId) {
      // error?
      return;
    }

    const day2ClusterId = await Day2ClusterService.getDay2ClusterId(openshiftClusterId);
    if (day2ClusterId) {
      return Day2ClusterService.fetchClusterById(day2ClusterId);
    }

    // The first time the user accesses "Add hosts" tab, the infraEnv(s) need to be created
    const createMultipleInfraEnvs =
      ocmCluster.cpu_architecture === OcmCpuArchitecture.MULTI || canSelectCpuArch;
    const cpuArchitectures = createMultipleInfraEnvs
      ? getSupportedCpuArchitectures(
          canSelectCpuArch ? canSelectCpuArch : false,
          supportedCpuArchitectures,
        )
      : ([mapOcmArchToCpuArchitecture(ocmCluster.cpu_architecture)] as SupportedCpuArchitecture[]);

    return Day2ClusterService.createCluster(
      openshiftClusterId,
      ocmCluster.display_name || ocmCluster.name || openshiftClusterId,
      getApiVipDnsName(ocmCluster).apiVipDnsname,
      pullSecret,
      openshiftVersion,
      cpuArchitectures,
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
    cpuArchitectures: SupportedCpuArchitecture[],
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
        cpuArchitecture: cpuArchitecture as ClusterCpuArchitecture,
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
      };
    }
    return treakedCluster;
  },
};

export default Day2ClusterService;
