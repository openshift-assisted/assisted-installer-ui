import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../common';

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
    generateName: `bmc-${values.hostname.split('.').shift()}-`,
    namespace,
  },
  type: 'Opaque',
});

export const getBareMetalHost = (
  values: {
    hostname: string;
    bmcAddress: string;
    disableCertificateVerification: boolean;
    bootMACAddress: string;
    online: boolean;
  },
  infraEnv: InfraEnvK8sResource,
  secret: SecretK8sResource,
) => ({
  apiVersion: 'metal3.io/v1alpha1',
  kind: 'BareMetalHost',
  metadata: {
    name: values.hostname,
    namespace: infraEnv.metadata?.namespace,
    labels: {
      [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv.metadata?.name,
    },
    annotations: {
      'inspect.metal3.io': 'disabled',
    },
  },
  spec: {
    bmc: {
      address: values.bmcAddress,
      credentialsName: secret.metadata?.name,
      disableCertificateVerification: !!values.disableCertificateVerification,
    },
    bootMACAddress: values.bootMACAddress,
    description: '', // TODO(mlibra)
    online: !!values.online,
    automatedCleaningMode: 'disabled',
  },
});

export const getWarningMessage = (hasAgents: boolean, hasBMHs: boolean) => {
  if (hasBMHs && hasAgents) {
    return 'The resource you are changing is already in use by hosts in the infrastructure environment. A change will require booting the hosts with a new discovery ISO file. Hosts will be rebooted automatically after the change is applied if using BMC.';
  } else if (hasBMHs) {
    return 'The resource you are changing is already in use by hosts in the infrastructure environment. The hosts will be rebooted automatically after the change is applied.';
  } else if (hasAgents) {
    return 'The resource you are changing is already in use by hosts in the infrastructure environment. A change will require booting the hosts with a new discovery ISO file.';
  } else {
    return 'A change will require booting hosts with a new discovery ISO file.';
  }
};
