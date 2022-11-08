import {
  ClusterOperatorK8sResource,
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
};

export type CimConfigurationFormProps = CimConfiguratioProps & {
  onClose: () => void;
  isEdit: boolean;
  docConfigUrl: string;
};

export type CimConfigurationModalProps = {
  onClose: () => void;
  isOpen: boolean;
  agentServiceConfig?: AgentServiceConfigK8sResource;
  platform: string;
  docDisconnectedUrl: string;
  docConfigUrl: string;

  createResource: CreateResourceFuncType;
  getResource: GetResourceFuncType;
  listResources: ListResourcesFuncType;
  patchResource: PatchResourceFuncType;
};

export type CimConfigMissingAlertProps = {
  onEnableCim: () => void;
  // onEnableCimDisconected: () => void;
  // insightsOperator?: ClusterOperatorK8sResource;
};
