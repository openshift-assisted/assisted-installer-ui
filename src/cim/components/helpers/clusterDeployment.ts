import { ObjectMetadata } from 'console-sdk-ai-lib';
import { parseStringLabels } from '../../../common';
import { ClusterDeploymentK8sResource } from '../../types';
import { AgentSelectorChangeProps } from '../ClusterDeployment/types';
import { AGENT_LOCATION_LABEL_KEY, RESERVED_AGENT_LABEL_KEY } from '../common';

export type ClusterDeploymentParams = {
  name: string;
  namespace: string;
  baseDnsDomain: string;
  annotations?: { [key: string]: string };
  pullSecretName: string;
};

// better than UID - we can calculate immediately without subsequent patching
export const getClusterDeploymentAgentReservedValue = (namespace: string, name: string) =>
  `cluster-deployment-${namespace}-${name}`;

const AGENT_BAREMETAL_ANNOTATION_PREFIX = 'agentBareMetal-agentSelector-';
export const getAgentSelectorFieldsFromAnnotations = (
  annotations: ObjectMetadata['annotations'] = {},
): AgentSelectorChangeProps | undefined => {
  const locations = annotations[AGENT_LOCATION_LABEL_KEY]?.split(',');

  // A location must be set
  if (!locations?.length) {
    return undefined;
  }

  const labels = Object.keys(annotations)
    .map((key) => {
      if (key.startsWith(AGENT_BAREMETAL_ANNOTATION_PREFIX)) {
        const label = key.substr(AGENT_BAREMETAL_ANNOTATION_PREFIX.length);
        return `${label}=${annotations[key]}`;
      }
      return undefined;
    })
    .filter(Boolean) as string[];

  console.log(
    '--- getAgentSelectorFieldsFromAnnotations, labels: ',
    labels,
    ', locations: ',
    locations,
  );

  return {
    labels,
    locations,
  };
};

export const getAnnotationsFromAgentSelector = (
  existingAnnotations: ObjectMetadata['annotations'],
  labelValuePairs?: string[],
  locations?: string[],
): ObjectMetadata['annotations'] => {
  const agentLabels = parseStringLabels(labelValuePairs || []);
  const annotations: ObjectMetadata['annotations'] = {
    ...(existingAnnotations || {}),
  };
  Object.keys(annotations).forEach((key) => {
    if (key.startsWith('agentBareMetal-agentSelector-')) {
      delete annotations[key];
    }
  });
  Object.keys(agentLabels).forEach((key) => {
    annotations[`agentBareMetal-agentSelector-${key}`] = agentLabels[key];
  });

  if (locations?.length) {
    annotations[AGENT_LOCATION_LABEL_KEY] = locations.join(',');
  }

  console.log('--- getAnnotationsFromAgentSelector, annotations: ', annotations);
  return annotations;
};

export const getClusterDeploymentResource = ({
  name,
  namespace,
  baseDnsDomain,
  annotations,
  pullSecretName,
}: ClusterDeploymentParams): ClusterDeploymentK8sResource => {
  const matchLabels = {
    [RESERVED_AGENT_LABEL_KEY]: getClusterDeploymentAgentReservedValue(namespace, name),
  };

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
            matchLabels,
          },
        },
      },
      pullSecretRef: {
        name: pullSecretName,
      },
    },
  };
};
