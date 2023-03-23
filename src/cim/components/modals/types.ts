import { DiscoveryImageFormValues } from '../../../common';
import { BMCFormProps } from '../Agent/types';
import {
  BareMetalHostK8sResource,
  NMStateK8sResource,
  AgentClusterInstallK8sResource,
  InfraEnvK8sResource,
} from '../../types/k8s';
import { SecretK8sResource } from '../../types/fromOCP';

export type AddHostModalProps = {
  onClose: VoidFunction;
  infraEnv: InfraEnvK8sResource;
  isOpen: boolean;
  onSaveISOParams: (values: DiscoveryImageFormValues) => Promise<void>;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  docVersion: string;
  isIPXE?: boolean;
};

export type AddBmcHostModalProps = Pick<
  BMCFormProps,
  'onCreateBMH' | 'onClose' | 'infraEnv' | 'usedHostnames'
> & {
  isOpen: boolean;
  docVersion: string;
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
  nmStates: NMStateK8sResource[];
  fetchSecret: (namespace: string, bmhName: string) => Promise<SecretK8sResource>;
};

export type EditSSHKeyFormikValues = {
  sshPublicKey: string;
};

export type EditPullSecretFormikValues = {
  pullSecret: string | undefined;
  createSecret: boolean;
};

export type EditNtpSourcesFormikValues = {
  enableNtpSources: string;
  additionalNtpSources: string;
};

export type UploadActionModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  // eslint-disable-next-line
  onCreateBmcByYaml: (yamlContent: unknown) => Promise<unknown>;
  isEdit?: boolean;
  docVersion: string;
  infraEnv: InfraEnvK8sResource;
};
