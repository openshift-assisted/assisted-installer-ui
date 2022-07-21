export const credentials = {
  apiVersion: 'v1',
  data: {
    password: '<<base64 of the password>>',
    username: '<<base64 of the password>>',
  },
  kind: 'Secret',
  metadata: {
    name: '<<name of credentials. Should be unique>>',
    namespace: '<<name of namespace>>',
  },
  type: 'Opaque',
};

export const host1 = {
  apiVersion: 'metal3.io/v1alpha1',
  kind: 'BareMetalHost',
  metadata: {
    annotations: {
      'bmac.agent-install.openshift.io/hostname': '<<the name of hostname>>',
      'inspect.metal3.io': 'disabled',
    },
    labels: {
      'infraenvs.agent-install.openshift.io':
        '<<the name of the infra env in which this host will be>>',
    },
    name: '<<name of bare metal host>>',
    namespace: '<<name of namespace>>',
  },
  spec: {
    automatedCleaningMode: 'disabled',
    bmc: {
      address: '<<Baseboard Management Controller Address>>',
      credentialsName: '<<name of credentials indicate in 7th line>>',
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
      'bmac.agent-install.openshift.io/hostname': '<<the name of hostname>>',
      'inspect.metal3.io': 'disabled',
    },
    labels: {
      'infraenvs.agent-install.openshift.io':
        '<<the name of the infra env in which this host will be>>',
    },
    name: '<<name of bare metal host>>',
    namespace: '<<name of namespace>>',
  },
  spec: {
    automatedCleaningMode: 'disabled',
    bmc: {
      address: '<<Baseboard Management Controller Address>>',
      credentialsName: '<<name of credentials indicate in 7th line>>',
      disableCertificateVerification: true,
    },
    bootMACAddress:
      "<<The MAC address of the host's network connected NIC that wll be used to provision the host.>>",
    online: false,
  },
};
