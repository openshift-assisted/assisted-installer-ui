import { TFunction } from 'i18next';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  BareMetalHostK8sResource,
  InfraEnvK8sResource,
  NMStateK8sResource,
  SecretK8sResource,
} from '../../types';
import {
  INFRAENV_AGENTINSTALL_LABEL_KEY,
  BMH_HOSTNAME_ANNOTATION,
  AGENT_BMH_NAME_LABEL_KEY,
} from '../common';
import { k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { AgentClusterInstallModel, AgentModel, BMHModel, NMStateModel } from '../../types/models';

export const getBareMetalHostCredentialsSecret = (
  values: {
    username: string;
    password: string;
    hostname: string;
  },
  namespace: string,
) => ({
  apiVersion: 'v1',
  kind: 'Secret',
  data: {
    username: btoa(values.username),
    password: btoa(values.password),
  },
  metadata: {
    generateName: `bmc-${values.hostname.split('.').shift() || ''}-`,
    namespace,
  },
  type: 'Opaque',
});

export const getBareMetalHost = (
  values: {
    name: string;
    hostname: string;
    bmcAddress: string;
    disableCertificateVerification: boolean;
    bootMACAddress: string;
    online: boolean;
  },
  infraEnv: InfraEnvK8sResource,
  secret: SecretK8sResource,
): BareMetalHostK8sResource => ({
  apiVersion: 'metal3.io/v1alpha1',
  kind: 'BareMetalHost',
  metadata: {
    name: values.name,
    namespace: infraEnv.metadata?.namespace,
    labels: {
      [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv.metadata?.name || '',
    },
    annotations: {
      'inspect.metal3.io': 'disabled',
      [BMH_HOSTNAME_ANNOTATION]: values.hostname,
    },
  },
  spec: {
    bmc: {
      address: values.bmcAddress,
      credentialsName: secret.metadata?.name || '',
      disableCertificateVerification: !!values.disableCertificateVerification,
    },
    bootMACAddress: values.bootMACAddress,
    description: '', // TODO(mlibra)
    online: !!values.online,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    automatedCleaningMode: 'disabled', // TODO is it a left-over and can be deleted? not in the Type
  },
});

export const getWarningMessage = (hasAgents: boolean, hasBMHs: boolean, t: TFunction) => {
  if (hasBMHs && hasAgents) {
    return t(
      'ai:The resource you are changing is already in use by hosts in the infrastructure environment. A change will require booting the hosts with a new discovery ISO file. Hosts will be rebooted automatically after the change is applied if using BMC.',
    );
  } else if (hasBMHs) {
    return t(
      'ai:The resource you are changing is already in use by hosts in the infrastructure environment. The hosts will be rebooted automatically after the change is applied.',
    );
  } else if (hasAgents) {
    return t(
      'ai:The resource you are changing is already in use by hosts in the infrastructure environment. A change will require booting the hosts with a new discovery ISO file.',
    );
  } else {
    return t('ai:A change will require booting hosts with a new discovery ISO file.');
  }
};

export const setProvisionRequirements = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  workerCount: number | undefined,
  masterCount: number | undefined,
) => {
  const provisionRequirements = { ...(agentClusterInstall.spec?.provisionRequirements || {}) };
  if (workerCount !== undefined) {
    provisionRequirements.workerAgents = workerCount;
  }
  if (masterCount !== undefined) {
    provisionRequirements.controlPlaneAgents = masterCount;
  }

  return k8sPatch({
    model: AgentClusterInstallModel,
    resource: agentClusterInstall,
    data: [
      {
        op: agentClusterInstall.spec?.provisionRequirements ? 'replace' : 'add',
        path: '/spec/provisionRequirements',
        value: provisionRequirements,
      },
    ],
  });
};

export const deleteHost = async (
  agent?: AgentK8sResource,
  bmh?: BareMetalHostK8sResource,
  agentClusterInstall?: AgentClusterInstallK8sResource,
  nmStates: NMStateK8sResource[] = [],
) => {
  if (agent) {
    await k8sDelete({
      model: AgentModel,
      resource: agent,
    });
  }
  if (bmh) {
    await k8sDelete({
      model: BMHModel,
      resource: bmh,
    });

    const bmhNMStates = (nmStates || []).filter(
      (nm) => nm.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY] === bmh.metadata?.name,
    );
    for (const nmState of bmhNMStates) {
      await k8sDelete({
        model: NMStateModel,
        resource: nmState,
      });
    }
  }

  if (agentClusterInstall) {
    const masterCount = undefined; /* Only workers can be removed */
    const workerCount = agentClusterInstall.spec?.provisionRequirements.workerAgents || 1;
    await setProvisionRequirements(agentClusterInstall, Math.max(0, workerCount - 1), masterCount);
  }
};

export const getAgentName = (resource?: AgentK8sResource | BareMetalHostK8sResource): string => {
  if (resource && 'spec' in resource && resource.spec && 'hostname' in resource.spec) {
    return resource.spec.hostname || resource?.metadata?.name || '-';
  }
  return resource?.metadata?.name || '-';
};
