import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { StatusCondition } from '../k8s';

export type SecretK8sResource = {
  data?: { [key: string]: string };
  stringData?: { [key: string]: string };
  type?: string;
} & K8sResourceCommon;

export type ConfigMapK8sResource = {
  data?: { [key: string]: string };
} & K8sResourceCommon;

type OperandVersion = {
  name: string;
  version: string;
};

type ClusterOperatorObjectReference = {
  group: string;
  resource: string;
  namespace?: string;
  name: string;
};

export type ClusterOperatorK8sResource = {
  spec: Record<string, unknown>;
  status: {
    conditions?: StatusCondition<string>[];
    versions?: OperandVersion[];
    relatedObjects?: ClusterOperatorObjectReference[];
  };
} & K8sResourceCommon;

export type RouteK8sResource = {
  spec: {
    host?: string;
    path?: string;
    port?: {
      targetPort: number | string;
    };
    subdomain?: string;
    wildcardPolicy?: string;
  };
} & K8sResourceCommon;
