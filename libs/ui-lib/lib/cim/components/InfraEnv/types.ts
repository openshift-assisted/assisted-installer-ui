import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { AgentClusterInstallK8sResource, InfraEnvK8sResource } from '../../types';
import { AddBmcHostModalProps, AddHostModalProps, UploadActionModalProps } from '../modals/types';

export type ProvisioningConfigResult = [K8sResourceCommon | null, boolean, unknown];

export type AddHostDropdownProps = {
  infraEnv: InfraEnvK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  docVersion: string;
  onSaveISOParams: AddHostModalProps['onSaveISOParams'];
  onCreateBMH: AddBmcHostModalProps['onCreateBMH'];
  usedHostnames: AddBmcHostModalProps['usedHostnames'];
  onCreateBmcByYaml: UploadActionModalProps['onCreateBmcByYaml'];
  provisioningConfigResult: ProvisioningConfigResult;
};
