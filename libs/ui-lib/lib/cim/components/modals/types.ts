import { BMCFormProps } from '../Agent/types';
import { AgentClusterInstallK8sResource, InfraEnvK8sResource } from '../../types/k8s';

export type EditProxyModalProps = {
  onClose: VoidFunction;
  infraEnv: InfraEnvK8sResource;
  hasAgents: boolean;
  hasBMHs: boolean;
};

export type AddHostModalProps = {
  onClose: VoidFunction;
  infraEnv: InfraEnvK8sResource;
  isOpen: boolean;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  docVersion: string;
  isIPXE?: boolean;
};

export type AddBmcHostModalProps = Pick<BMCFormProps, 'onClose' | 'infraEnv' | 'usedHostnames'> & {
  isOpen: boolean;
  docVersion: string;
};

export type EditSSHKeyFormikValues = {
  sshPublicKey: string;
};

export type EditPullSecretFormikValues = {
  pullSecret: string;
  createSecret: boolean;
};

export type EditNtpSourcesFormikValues = {
  enableNtpSources: string;
  additionalNtpSources: string;
};

export type UploadActionModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  isEdit?: boolean;
  docVersion: string;
  infraEnv: InfraEnvK8sResource;
};
