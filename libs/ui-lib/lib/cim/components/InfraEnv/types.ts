import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { AgentClusterInstallK8sResource, InfraEnvK8sResource } from '../../types';
import { AddBmcHostModalProps } from '../modals/types';

export type ProvisioningConfigResult = [K8sResourceCommon | null, boolean, unknown];

export type AddHostDropdownProps = {
  infraEnv: InfraEnvK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  docVersion: string;
  usedHostnames: AddBmcHostModalProps['usedHostnames'];
};
