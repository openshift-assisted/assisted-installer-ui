import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { INFRAENV_AGENTINSTALL_LABEL_KEY, BMH_HOSTNAME_ANNOTATION } from '../common';

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
    name: string;
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
    name: values.name,
    namespace: infraEnv.metadata?.namespace,
    labels: {
      [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv.metadata?.name,
    },
    annotations: {
      'inspect.metal3.io': 'disabled',
      [BMH_HOSTNAME_ANNOTATION]: values.hostname,
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
