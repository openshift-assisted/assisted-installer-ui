import { InfraEnvsService } from '.';
import { OcmClusterType } from '../components';
import { ClustersAPI, HostsAPI } from './apis';
import {
  CpuArchitecture,
  hasMultiArchitecture,
  SupportedCpuArchitectures,
  Cluster,
  InfraEnvCreateParams,
} from '../../common';

const createNecessaryInfraEnvs = (
  clusterCpuArchitecture: CpuArchitecture,
  baseInfraEnvDetails: InfraEnvCreateParams,
) => {
  const createAllInfraEnvs = hasMultiArchitecture({
    openshiftVersion: baseInfraEnvDetails.openshiftVersion,
  });

  const infraEnvsToCreate = [];
  if (createAllInfraEnvs) {
    SupportedCpuArchitectures.forEach((cpuArchitecture) => {
      infraEnvsToCreate.push(
        InfraEnvsService.create({
          ...baseInfraEnvDetails,
          cpuArchitecture: cpuArchitecture,
        }),
      );
    });
  } else {
    infraEnvsToCreate.push(
      InfraEnvsService.create({
        ...baseInfraEnvDetails,
        cpuArchitecture: clusterCpuArchitecture,
      }),
    );
  }
  return Promise.all(infraEnvsToCreate);
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

    const { data: clusters } = await ClustersAPI.listByOpenshiftId(openshiftClusterId);
    const day2Clusters = clusters.filter((cluster) => cluster.kind === 'AddHostsCluster');

    if (day2Clusters.length !== 0) {
      const { data } = await ClustersAPI.get(day2Clusters[0].id);
      data.hosts = await Day2ClusterService.fetchHosts(data.id);
      return data;
    } else {
      return Day2ClusterService.createCluster(
        openshiftClusterId,
        ocmCluster.display_name || ocmCluster.name || openshiftClusterId,
        apiVipDnsname,
        pullSecret,
        openshiftVersion,
        (ocmCluster.cpu_architecture as CpuArchitecture) || CpuArchitecture.x86,
      );
    }
  },

  async fetchClusterById(clusterId: Cluster['id']) {
    const { data } = await ClustersAPI.get(clusterId);
    data.hosts = await Day2ClusterService.fetchHosts(data.id);
    return data;
  },

  async createCluster(
    openshiftClusterId: OcmClusterType['external_id'],
    clusterName: string,
    apiVipDnsname: string,
    pullSecret: string,
    openshiftVersion: string,
    cpuArchitecture: CpuArchitecture,
  ) {
    const { data } = await ClustersAPI.registerAddHosts({
      openshiftClusterId, // used to both match OpenShift Cluster and as an assisted-installer ID
      name: `scale-up-${clusterName}`, // both cluster.name and cluster.display-name contain just UUID which fails AI validation (k8s naming conventions)
      apiVipDnsname,
      openshiftVersion,
    });

    // Create all the infra-env for all the existing CPU architectures
    await createNecessaryInfraEnvs(cpuArchitecture, {
      name: `${data.name || ''}_infra-env`,
      pullSecret,
      clusterId: data.id,
      openshiftVersion,
    });

    return data;
  },

  async fetchHosts(clusterId: Cluster['id']) {
    const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
    const { data } = await HostsAPI.list(infraEnvId);
    return data;
  },
};

export default Day2ClusterService;
