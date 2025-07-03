import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useProvisioningConfig = () =>
  useK8sWatchResource<K8sResourceCommon>(
    {
      groupVersionKind: {
        group: 'metal3.io',
        version: 'v1alpha1',
        kind: 'Provisioning',
      },
    },
    {
      name: 'provisioning-configuration',
    },
  );
