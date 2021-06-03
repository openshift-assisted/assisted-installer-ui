import { dump } from 'js-yaml';

export const getNMStateTemplate = (macAddress: string): string => {
  return dump({
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'NMStateConfig',
    metadata: {
      generateName: 'nmstateconfig-',
      labels: {
        'some-user-defined-label-name': 'some-user-defined-label-value',
      },
    },
    spec: {
      interfaces: [
        {
          name: 'eth0',
          macAddress,
        },
      ],
    },
  });
};
