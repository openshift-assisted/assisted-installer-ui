import { AddBmcValues } from './types';

export const getBareMetalHostCredentialsSecret = (
  values: AddBmcValues,
  namespace: string,
  SecretModel: { apiVersion: string; kind: string },
) => {
  const credentialsSecret = {
    apiVersion: SecretModel.apiVersion,
    kind: SecretModel.kind,
    stringData: {
      username: btoa(values.username),
      password: btoa(values.password),
    },
    metadata: {
      generateName: `bmc-${values.hostname.split('.').shift()}-`,
      namespace,
    },
    type: 'Opaque',
  };

  return credentialsSecret;
};

export const getBareMetalHost = (
  values: AddBmcValues,
  namespace: string,
  secretName: string,
  BareMetalHostModel: { apiGroup?: string; apiVersion: string; kind: string },
) => {
  const bmh = {
    apiVersion: `${BareMetalHostModel.apiGroup}/${BareMetalHostModel.apiVersion}`,
    kind: BareMetalHostModel.kind,
    metadata: {
      name: values.hostname,
      namespace,
      labels: {
        'infraenvs.agent-install.openshift.io': 'test-cluster-virtual-installenv',
      },
      annotations: {
        'inspect.metal3.io': 'disabled',
      },
    },
    spec: {
      bmc: {
        address: values.bmcAddress,
        credentialsName: secretName,
        disableCertificateVerification: !!values.disableCertificateVerification,
      },
      bootMACAddress: values.bootMACAddress,
      description: '', // TODO(mlibra)
      online: !!values.online,
      automatedCleaningMode: 'disabled',
    },
  };
  return bmh;
};
