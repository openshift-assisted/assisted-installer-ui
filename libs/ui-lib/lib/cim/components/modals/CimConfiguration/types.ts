import { AgentServiceConfigK8sResource } from '../../../types/k8s/agent-service-config';

export type CimConfigurationValues = {
  dbVolSize: number;
  fsVolSize: number;
  imgVolSize: number;
  configureLoadBalancer: boolean;
};

export type CimConfigProgressAlertProps = {
  agentServiceConfig?: AgentServiceConfigK8sResource;
  assistedServiceDeploymentUrl: string;
};

export type CimConfigurationFormFieldsProps = {
  isEdit: boolean;
  isInProgressPeriod: boolean;
  docConfigUrl: string;
  docConfigAwsUrl: string;
  platform: string;
  configureLoadBalancerInitial: boolean;
  setConfigureLoadBalancerInitial: (value: boolean) => void;
};

export type CimConfigurationModalProps = {
  onClose: () => void;
  isOpen: boolean;
  agentServiceConfig?: AgentServiceConfigK8sResource;
  platform: string;
  docDisconnectedUrl: string;
  docConfigUrl: string;
  docConfigAwsUrl: string;
};

export type CimConfigMissingAlertProps = {
  onEnableCim: () => void;
};
