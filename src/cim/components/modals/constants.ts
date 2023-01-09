export const credentials = {
  apiVersion: 'v1',
  data: {
    username: '<<base64 of the username>>',
    password: '<<base64 of the password>>',
  },
  kind: 'Secret',
  metadata: {
    name: '<<name of credentials. Should be unique>>',
    namespace: '<<name of namespace - usually the same as the name of the infra env>>',
  },
  type: 'Opaque',
};

export const host1 = {
  apiVersion: 'metal3.io/v1alpha1',
  kind: 'BareMetalHost',
  metadata: {
    annotations: {
      'bmac.agent-install.openshift.io/hostname': '<<hostname of the host>>',
      'inspect.metal3.io': 'disabled',
    },
    labels: {
      'infraenvs.agent-install.openshift.io':
        '<<the name of the infra env in which this host will be>>',
    },
    name: '<<the name of the BareMetalHost CR>>',
    namespace: '<<name of namespace - usually the same as the name of the infra env>>',
  },
  spec: {
    automatedCleaningMode: 'disabled',
    bmc: {
      address: '<<Baseboard Management Controller Address>>',
      credentialsName: '<<the name of the secret containing the credentials (defined in line 7)>>',
      disableCertificateVerification: true,
    },
    bootMACAddress:
      "<<The MAC address of the host's network connected NIC that wll be used to provision the host.>>",
    online: false,
  },
};

export const host2 = {
  apiVersion: 'metal3.io/v1alpha1',
  kind: 'BareMetalHost',
  metadata: {
    annotations: {
      'bmac.agent-install.openshift.io/hostname': '<<hostname of the host>>',
      'inspect.metal3.io': 'disabled',
    },
    labels: {
      'infraenvs.agent-install.openshift.io':
        '<<the name of the infra env in which this host will be>>',
    },
    name: '<<the name of the BareMetalHost CR>>',
    namespace: '<<name of namespace - usually the same as the name of the infra env>>',
  },
  spec: {
    automatedCleaningMode: 'disabled',
    bmc: {
      address: '<<Baseboard Management Controller Address>>',
      credentialsName: '<<the name of the secret containing the credentials (defined in line 7)>>',
      disableCertificateVerification: true,
    },
    bootMACAddress:
      "<<The MAC address of the host's network connected NIC that wll be used to provision the host.>>",
    online: false,
  },
};
