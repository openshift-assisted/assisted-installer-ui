import { FormikProps } from 'formik';
import { AgentK8sResource } from '../../../../types';

export type NetworkFormValues = {
  machineCIDR: string;
  isAdvanced: boolean;
  sshPublicKey: string;
  serviceNetworkCidr: string;
  clusterNetworkCidr: string;
  enableProxy: boolean;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  apiPublishingStrategy: 'LoadBalancer' | 'NodePort';
  nodePortPort: number;
  nodePortAddress: string;
  clusterNetworkHostPrefix: number;
};

export type NetworkFormProps = Pick<NetworkStepProps, 'agents' | 'onValuesChanged'>;

export type NetworkStepProps = {
  agents: AgentK8sResource[];
  formRef: React.Ref<FormikProps<NetworkFormValues>>;
  onValuesChanged: (values: NetworkFormValues, initRender: boolean) => void;
  initialValues: NetworkFormValues;
  count: number;
};
