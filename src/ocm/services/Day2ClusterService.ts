import { InfraEnvsService } from '.';
import { ClustersAPI } from './apis';
import { CpuArchitecture, Cluster, SupportedCpuArchitectures } from '../../common';
import { OcmClusterType } from '../components/AddHosts/types';

const Day2ClusterService = {
  getOpenshiftClusterId(ocmCluster?: OcmClusterType) {
    return ocmCluster && ocmCluster.external_id;
  },

  async fetchCluster(
    ocmCluster: OcmClusterType,
    pullSecret: string,
    openshiftVersion: string,
    day1CpuArchitecture: CpuArchitecture,
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

    const { data: clusters } = await ClustersAPI.listByOpenshiftId(openshiftClusterId);
    const day2Clusters = clusters.filter((cluster) => cluster.kind === 'AddHostsCluster');

    if (day2Clusters.length !== 0) {
      return Day2ClusterService.fetchClusterById(day2Clusters[0].id);
    } else {
      const cpuArchitectures = isMultiArch ? SupportedCpuArchitectures : [day1CpuArchitecture];
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
};

export default Day2ClusterService;
