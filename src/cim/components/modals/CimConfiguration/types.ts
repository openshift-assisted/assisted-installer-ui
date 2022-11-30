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
  configureLoadBalancerInitial: boolean;
  setConfigureLoadBalancer: (v: boolean) => void;
};

export type CimConfigProgressAlertProps = {
  agentServiceConfig?: AgentServiceConfigK8sResource;
  assistedServiceDeploymentUrl: string;
};

export type CimConfigurationFormProps = CimConfiguratioProps & {
  onClose: () => void;
  isEdit: boolean;
  isInProgressPeriod: boolean;
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

  createResource: CreateResourceFuncType;
  getResource: GetResourceFuncType;
  listResources: ListResourcesFuncType;
  patchResource: PatchResourceFuncType;
};

export type CimConfigMissingAlertProps = {
  onEnableCim: () => void;
};
