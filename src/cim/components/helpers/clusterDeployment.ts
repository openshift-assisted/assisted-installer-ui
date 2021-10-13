import { ObjectMetadata } from 'console-sdk-ai-lib';
import { getHumanizedDateTime, parseStringLabels } from '../../../common';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import {
  AgentSelectorChangeProps,
  ClusterDeploymentHostsSelectionValues,
} from '../ClusterDeployment/types';
import {
  AGENT_LOCATION_LABEL_KEY,
  AGENT_AUTO_SELECT_ANNOTATION_KEY,
  AGENT_SELECTOR,
} from '../common';

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

  if (locations?.length) {
    annotations[AGENT_LOCATION_LABEL_KEY] = locations.join(',');
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

export const getConsoleUrl = (clusterDeployment: ClusterDeploymentK8sResource) =>
  clusterDeployment.status?.webConsoleURL ||
  `https://console-openshift-console.apps.${clusterDeployment.spec?.clusterName}.${clusterDeployment.spec?.baseDomain}`;

export const getClusterApiUrl = (clusterDeployment: ClusterDeploymentK8sResource) =>
  clusterDeployment?.status?.apiURL ||
  `https://api.${clusterDeployment.spec?.clusterName}.${clusterDeployment.spec?.baseDomain}`;

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
): { [key in ClusterPropertyKeys]: ClusterPropertyItem } => ({
  name: {
    key: 'Name',
    value: clusterDeployment.metadata?.name,
  },
  openshiftVersion: {
    key: 'OpenShift version',
    value: agentClusterInstall?.spec?.imageSetRef?.name,
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
    key: 'API Virtual IP',
    value: agentClusterInstall?.spec?.apiVIP,
  },
  ingressVip: {
    key: 'Ingress Virtual IP',
    value: agentClusterInstall?.spec?.ingressVIP,
  },
  clusterNetworkCidr: {
    key: 'Cluster network CIDR',
    value: agentClusterInstall.spec?.networking?.clusterNetwork?.[0].cidr,
  },
  clusterNetworkHostPrefix: {
    key: 'Cluster network host prefix',
    value: agentClusterInstall.spec?.networking?.clusterNetwork?.[0]?.hostPrefix,
  },
  serviceNetworkCidr: {
    key: 'Service network CIDR',
    value: agentClusterInstall.spec?.networking?.serviceNetwork?.[0],
  },
  installedTimestamp: {
    key: 'Installed at',
    value: getHumanizedDateTime(clusterDeployment.status?.installedTimestamp),
  },
});
