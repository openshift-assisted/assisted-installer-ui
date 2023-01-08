import {
  AgentClusterInstallK8sResource,
  ClusterDeploymentK8sResource,
  InfraEnvK8sResource,
  SecretK8sResource,
} from '../../types';
import { EnvironmentStepFormValues } from './InfraEnvFormPage';
import { getClusterDeploymentResource } from '../helpers';
import { AGENT_LOCATION_LABEL_KEY } from '../common';

export const getLabels = (values: EnvironmentStepFormValues) =>
  values.labels.reduce((acc, curr) => {
    const label = curr.split('=');
    acc[label[0]] = label[1];
    return acc;
  }, {} as Record<string, string>);

// TODO(mlibra): This should not be needed once we have late-binding
export const getClusterDeploymentForInfraEnv = (
  pullSecretName: string,
  namespace: string,
  values: EnvironmentStepFormValues,
): ClusterDeploymentK8sResource =>
  getClusterDeploymentResource({
    name: values.name,
    namespace,
    baseDnsDomain: '', // TODO(mlibra): This function is about to be removed anyway
    annotations: getLabels(values),
    pullSecretName,
  });

type GetAgentClusterInstallProps = {
  clusterDeploymentName?: string;
  namespace: string;
  values: EnvironmentStepFormValues;
};

export const getAgentClusterInstall = ({
  clusterDeploymentName,
  namespace,
  values,
}: GetAgentClusterInstallProps): AgentClusterInstallK8sResource => {
  const obj: AgentClusterInstallK8sResource = {
    apiVersion: 'extensions.hive.openshift.io/v1beta1',
    kind: 'AgentClusterInstall',
    metadata: {
      name: values.name,
      namespace,
    },
    spec: {
      holdInstallation: true,
      clusterDeploymentRef: clusterDeploymentName
        ? {
            name: clusterDeploymentName,
            namespace,
          }
        : {},
      networking: {
        clusterNetwork: [
          {
            cidr: '10.128.0.0/14', // '10.128.0.0/14',
            hostPrefix: 23, // 23,
          },
        ],
        serviceNetwork: ['172.30.0.0/16'],
      },
      provisionRequirements: {
        controlPlaneAgents: 3,
      },
      imageSetRef: {
        name: 'openshift-v4.8.0', // 'openshift-v4.7.0',
      },
    },
  };

  if (obj.spec && values.sshPublicKey) {
    obj.spec.sshPublicKey = values.sshPublicKey;
  }

  return obj;
};

export const getSecret = (
  namespace: string,
  values: EnvironmentStepFormValues,
): SecretK8sResource => ({
  kind: 'Secret',
  apiVersion: 'v1',
  metadata: {
    name: values.name,
    namespace,
  },
  data: {
    '.dockerconfigjson': btoa(values.pullSecret),
  },
  type: 'kubernetes.io/dockerconfigjson',
});

export const getInfraEnv = (
  namespace: string,
  values: EnvironmentStepFormValues,
): InfraEnvK8sResource => {
  const labels = getLabels(values);
  if (values.location) {
    labels[AGENT_LOCATION_LABEL_KEY] = labels[AGENT_LOCATION_LABEL_KEY] || values.location;
  }

  const infraEnv: InfraEnvK8sResource = {
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'InfraEnv',
    metadata: {
      name: values.name,
      namespace,
      labels: {
        [AGENT_LOCATION_LABEL_KEY]: values.location,
      },
    },
    spec: {
      agentLabels: labels,
      clusterRef: {
        name: values.name,
        namespace,
      },
      pullSecretRef: {
        name: values.name,
      },
      sshAuthorizedKey: values.sshPublicKey,
    },
    status: {
      agentLabelSelector: {
        matchLabels: labels,
      },
    },
  };

  if (infraEnv.spec && values.enableProxy) {
    infraEnv.spec.proxy = {
      httpProxy: values.httpProxy,
      httpsProxy: values.httpsProxy,
      noProxy: values.noProxy,
    };
  }
  return infraEnv;
};
