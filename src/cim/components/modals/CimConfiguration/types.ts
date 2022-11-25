import {
  CreateResourceFuncType,
  GetResourceFuncType,
  ListResourcesFuncType,
  PatchResourceFuncType,
} from '../../../types';
import { AgentServiceConfigK8sResource } from '../../../types/k8s/agent-service-config';

export type CimConfiguratioProps = {
  dbVolSize: number;
  dbVolSizeValidation?: string;
  setDbVolSize: (v: number) => void;
  fsVolSize: number;
  fsVolSizeValidation?: string;
  setFsVolSize: (v: number) => void;
  imgVolSize: number;
  imgVolSizeValidation?: string;
  setImgVolSize: (v: number) => void;
  configureLoadBalancer: boolean;
  setConfigureLoadBalancer: (v: boolean) => void;
};

export type CimConfigProgressAlertProps = {
  agentServiceConfig?: AgentServiceConfigK8sResource;
  showSuccess: boolean;
  showError: boolean;
  showTroublehooting: boolean;
  assistedServiceDeploymentUrl?: string;
  showProgress: boolean;
};

export type CimConfigurationFormProps = CimConfiguratioProps & {
  onClose: () => void;
  isEdit: boolean;
  docConfigUrl: string;
  docConfigAwsUrl: string;
};

export type CimConfigurationModalProps = {
  onClose: () => void;
  isOpen: boolean;
  agentServiceConfig?: AgentServiceConfigK8sResource;
  platform: string;
  docDisconnectedUrl: string;
  docConfigUrl: string;
  docConfigAwsUrl: string;
  assistedServiceDeploymentUrl: string;

  createResource: CreateResourceFuncType;
  getResource: GetResourceFuncType;
  listResources: ListResourcesFuncType;
  patchResource: PatchResourceFuncType;
};

export type CimConfigMissingAlertProps = {
  onEnableCim: () => void;
};
