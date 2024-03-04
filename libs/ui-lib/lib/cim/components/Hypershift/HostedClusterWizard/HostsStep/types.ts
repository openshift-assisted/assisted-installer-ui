import { FormikProps } from 'formik';
import { AgentK8sResource, InfraEnvK8sResource } from '../../../../types';
import { NodePoolFormValues, NodePoolK8sResource } from '../../types';

export type NodePoolFormValue = {
  clusterName: string;
  releaseImage: string;
} & NodePoolFormValues;

export type HostsFormValues = {
  controllerAvailabilityPolicy: string;
  infrastructureAvailabilityPolicy: string;
  agentNamespace: string;
  nodePools: NodePoolFormValue[];
};

export type HostsFormProps = Pick<
  HostsStepProps,
  'onValuesChanged' | 'infraEnvs' | 'agents' | 'clusterName' | 'initReleaseImage'
>;

export type HostsStepProps = {
  formRef: React.Ref<FormikProps<HostsFormValues>>;
  onValuesChanged: (values: HostsFormValues, initRender: boolean) => void;
  infraEnvs: InfraEnvK8sResource[];
  agents: AgentK8sResource[];
  clusterName: string;
  initReleaseImage: string;
  initInfraEnv?: string;
  initNodePools?: NodePoolFormValue[];
  nodePools: NodePoolK8sResource[];
  controllerAvailabilityPolicy: string;
  infrastructureAvailabilityPolicy: string;
};
