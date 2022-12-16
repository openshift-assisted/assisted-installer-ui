import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import { CpuArchitecture, getHumanizedDateTime, parseStringLabels } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  ClusterDeploymentK8sResource,
  InfraEnvK8sResource,
} from '../../types';
import {
  AgentSelectorChangeProps,
  ClusterDeploymentHostsSelectionValues,
} from '../ClusterDeployment/types';
import {
  AGENT_LOCATION_LABEL_KEY,
  AGENT_AUTO_SELECT_ANNOTATION_KEY,
  AGENT_SELECTOR,
  CPU_ARCHITECTURE_ANNOTATION_KEY,
} from '../common';
import { getClusterStatus } from './status';

export type ClusterDeploymentParams = {
  name: string;
  namespace: string;
  baseDnsDomain: string;
  annotations?: { [key: string]: string };
  pullSecretName: string;
};

export const getAgentSelectorFieldsFromAnnotations = (
  annotations: ObjectMetadata['annotations'] = {},
): AgentSelectorChangeProps => {
  const locations = annotations[AGENT_LOCATION_LABEL_KEY]?.split(',') || [];

  const labels = Object.keys(annotations)
    .map((key) => {
      if (key.startsWith(AGENT_SELECTOR)) {
        const label = key.substr(AGENT_SELECTOR.length);
        return `${label}=${annotations[key]}`;
      }
      return undefined;
    })
    .filter(Boolean) as string[];

  return {
    labels,
    locations,
    autoSelect:
      !annotations[AGENT_AUTO_SELECT_ANNOTATION_KEY] ||
      annotations[AGENT_AUTO_SELECT_ANNOTATION_KEY] === 'true',
  };
};

export const getAnnotationsFromAgentSelector = (
  clusterDeployment: ClusterDeploymentK8sResource,
  values: ClusterDeploymentHostsSelectionValues,
): ObjectMetadata['annotations'] => {
  const { agentLabels: labelValuePairs, locations, autoSelectHosts } = values;
  const agentLabels = parseStringLabels(labelValuePairs || []);
  const annotations: ObjectMetadata['annotations'] = {
    ...(clusterDeployment?.metadata?.annotations || {}),
  };
  Object.keys(annotations).forEach((key) => {
    if (key.startsWith(AGENT_SELECTOR)) {
      delete annotations[key];
    }
  });
  Object.keys(agentLabels).forEach((key) => {
    annotations[`${AGENT_SELECTOR}${key}`] = agentLabels[key];
  });

  delete annotations[AGENT_AUTO_SELECT_ANNOTATION_KEY];

  if (locations.length) {
    annotations[AGENT_LOCATION_LABEL_KEY] = locations.join(',');
  } else {
    delete annotations[AGENT_LOCATION_LABEL_KEY];
  }

  if (!autoSelectHosts) {
    annotations[AGENT_AUTO_SELECT_ANNOTATION_KEY] = 'false';
  }
  return annotations;
};

export const getClusterDeploymentResource = ({
  name,
  namespace,
  baseDnsDomain,
  annotations,
  pullSecretName,
}: ClusterDeploymentParams): ClusterDeploymentK8sResource => {
  return {
    apiVersion: 'hive.openshift.io/v1',
    kind: 'ClusterDeployment',
    metadata: {
      name: name,
      namespace,
      annotations,
    },
    spec: {
      baseDomain: baseDnsDomain,
      clusterInstallRef: {
        group: 'extensions.hive.openshift.io',
        kind: 'AgentClusterInstall',
        name: name,
        version: 'v1beta1',
      },
      clusterName: name,
      platform: {
        agentBareMetal: {
          agentSelector: {
            /* So far left empty, annotations are used instead.
               Needs https://issues.redhat.com/browse/HIVE-1636 to be fixed.
             */
          },
        },
      },
      pullSecretRef: {
        name: pullSecretName,
      },
    },
  };
};

// Temporary workaround until https://issues.redhat.com/browse/HIVE-1666
const WORKAROUND_COMPUTEDURLS_CLUSTER_STATUS = ['adding-hosts', 'installed', 'finalizing'];

export const getConsoleUrl = (
  clusterDeployment?: ClusterDeploymentK8sResource,
  agentClusterInstall?: AgentClusterInstallK8sResource,
) =>
  clusterDeployment?.status?.webConsoleURL ||
  (WORKAROUND_COMPUTEDURLS_CLUSTER_STATUS.includes(getClusterStatus(agentClusterInstall)[0])
    ? `https://console-openshift-console.apps.${clusterDeployment?.spec?.clusterName}.${clusterDeployment?.spec?.baseDomain}`
    : undefined);

export const getClusterApiUrl = (
  clusterDeployment?: ClusterDeploymentK8sResource,
  agentClusterInstall?: AgentClusterInstallK8sResource,
) =>
  clusterDeployment?.status?.apiURL ||
  (WORKAROUND_COMPUTEDURLS_CLUSTER_STATUS.includes(getClusterStatus(agentClusterInstall)[0])
    ? `https://api.${clusterDeployment?.spec?.clusterName}.${clusterDeployment?.spec?.baseDomain}`
    : undefined);

type ClusterPropertyKeys =
  | 'name'
  | 'openshiftVersion'
  | 'baseDnsDomain'
  | 'apiVip'
  | 'ingressVip'
  | 'clusterId'
  | 'clusterNetworkCidr'
  | 'clusterNetworkHostPrefix'
  | 'serviceNetworkCidr'
  | 'installedTimestamp';

type ClusterPropertyItem = {
  key: string;
  value?: React.ReactNode;
};

export const getClusterProperties = (
  clusterDeployment: ClusterDeploymentK8sResource,
  agentClusterInstall: AgentClusterInstallK8sResource,
): { [key in ClusterPropertyKeys]: ClusterPropertyItem } => {
  const serviceNetworks = agentClusterInstall.spec?.networking?.serviceNetwork;
  const clusterNetworks = agentClusterInstall.spec?.networking?.clusterNetwork;

  return {
    // TODO: we should translate following keys since they are used "as it is" in AcmDescriptionList.tsx / List component of the stolostron project
    name: {
      key: 'Name',
      value: clusterDeployment.metadata?.name,
    },
    openshiftVersion: {
      key: 'OpenShift version',
      value: clusterDeployment.status?.installVersion,
    },
    clusterId: {
      key: 'Cluster ID',
      value: clusterDeployment.metadata?.uid,
    },
    baseDnsDomain: {
      key: 'Base DNS domain',
      value: clusterDeployment.spec?.baseDomain,
    },
    apiVip: {
      key: 'API IP',
      value: agentClusterInstall?.spec?.apiVIP,
    },
    ingressVip: {
      key: 'Ingress IP',
      value: agentClusterInstall?.spec?.ingressVIP,
    },
    clusterNetworkCidr: {
      key: (clusterNetworks?.length || 0) > 1 ? 'Cluster network CIDRs' : 'Cluster network CIDR',
      value: clusterNetworks?.map((n) => n.cidr).join(', '),
    },
    clusterNetworkHostPrefix: {
      key:
        (clusterNetworks?.length || 0) > 1
          ? 'Cluster network host prefixes'
          : 'Cluster network host prefix',
      value: clusterNetworks?.map((n) => n.hostPrefix).join(', '),
    },
    serviceNetworkCidr: {
      key: (serviceNetworks?.length || 0) > 1 ? 'Service network CIDRs' : 'Service network CIDR',
      value: serviceNetworks?.join(', '),
    },
    installedTimestamp: {
      key: 'Installed at',
      value: getHumanizedDateTime(clusterDeployment.status?.installedTimestamp),
    },
  };
};

export const getClusterDeploymentCpuArchitecture = (
  clusterDeployment: ClusterDeploymentK8sResource,
  infraEnv?: InfraEnvK8sResource,
) => {
  let arch;
  if (
    infraEnv &&
    isEqual(infraEnv.spec?.clusterRef, pick(clusterDeployment.metadata, ['name', 'namespace']))
  ) {
    arch = infraEnv.spec?.cpuArchitecture;
  } else {
    arch = clusterDeployment.metadata?.annotations?.[CPU_ARCHITECTURE_ANNOTATION_KEY];
  }

  return arch === CpuArchitecture.ARM ? CpuArchitecture.ARM : CpuArchitecture.x86;
};
