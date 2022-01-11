import { DiscoveryImageFormValues } from '../../../common';
import { BMCFormProps } from '../Agent/types';
import {
  BareMetalHostK8sResource,
  NMStateK8sResource,
  AgentClusterInstallK8sResource,
} from '../../types/k8s';
import { SecretK8sResource } from '../../types/fromOCP';

export type AddHostModalProps = Pick<
  BMCFormProps,
  'onClose' | 'onCreateBMH' | 'infraEnv' | 'usedHostnames'
> & {
  isOpen: boolean;
  isBMPlatform: boolean;
  onSaveISOParams: (values: DiscoveryImageFormValues) => Promise<void>;
  agentClusterInstall?: AgentClusterInstallK8sResource;
};

export type EditBMHModalProps = Pick<
  BMCFormProps,
  'onClose' | 'infraEnv' | 'bmh' | 'usedHostnames'
> & {
  isOpen: boolean;
  onEdit: (resources: {
    bmh?: BareMetalHostK8sResource;
    secret?: SecretK8sResource;
    nmState?: NMStateK8sResource;
  }) => BMCFormProps['onCreateBMH'];
  fetchNMState: (namespace: string, name: string) => Promise<NMStateK8sResource>;
  fetchSecret: (namespace: string, bmhName: string) => Promise<SecretK8sResource>;
};
