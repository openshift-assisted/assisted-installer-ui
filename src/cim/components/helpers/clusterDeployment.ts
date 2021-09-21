import { ObjectMetadata } from 'console-sdk-ai-lib';
import { parseStringLabels } from '../../../common';
import { ClusterDeploymentK8sResource } from '../../types';
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
