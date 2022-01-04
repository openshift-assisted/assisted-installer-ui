import { InfraEnvsService } from '.';
import { Cluster } from '../../common/api/types';
import { OcmClusterType } from '../components/AddHosts/types';
import { ClustersAPI, HostsAPI } from './apis';

const Day2ClusterService = {
  getOpenshiftClusterId(ocmCluster?: OcmClusterType) {
    return ocmCluster && ocmCluster.external_id;
  },

  async fetchCluster(ocmCluster: OcmClusterType, openshiftVersion: string, pullSecret: string) {
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
      const { data } = await ClustersAPI.get(day2Clusters[0].id);
      data.hosts = await this.fetchHosts(data.id);
      return data;
    } else {
      return this.createCluster(
        openshiftClusterId,
        ocmCluster.display_name || ocmCluster.name || openshiftClusterId,
        openshiftVersion,
        apiVipDnsname,
        pullSecret,
      );
    }
  },

  async fetchClusterById(clusterId: Cluster['id']) {
    const { data } = await ClustersAPI.get(clusterId);
    data.hosts = await this.fetchHosts(data.id);
    return data;
  },

  async createCluster(
    openshiftClusterId: OcmClusterType['external_id'],
    clusterName: string,
    openshiftVersion: string,
    apiVipDnsname: string,
    pullSecret: string,
  ) {
    const { data } = await ClustersAPI.registerAddHosts({
      openshiftClusterId, // used to both match OpenShift Cluster and as an assisted-installer ID
      name: `scale-up-${clusterName}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
      openshiftVersion,
      apiVipDnsname,
    });

    await InfraEnvsService.create({
      name: `${data.name}_infra-env`,
      pullSecret,
      clusterId: data.id,
      // TODO(jkilzi): MGMT-7709 will deprecate the openshiftVersion field, remove the line below once it happens.
      openshiftVersion,
    });

    data.hosts = await this.fetchHosts(data.id);
    return data;
  },

  async fetchHosts(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    const { data } = await HostsAPI.list(infraEnvId);
    return data;
  },
};

export default Day2ClusterService;
