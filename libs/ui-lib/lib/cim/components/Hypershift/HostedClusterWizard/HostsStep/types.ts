import { FormikProps } from 'formik';
import { AgentK8sResource, InfraEnvK8sResource } from '../../../../types';
import { NodePoolK8sResource } from '../../types';

export type NodePoolFormValue = {
  name: string;
  clusterName: string;
  count: number;
  agentLabels: {
    key: string;
    value: string;
  }[];
  releaseImage: string;
};

export type HostsFormValues = {
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
};
