import { FormikProps } from 'formik';

export type NetworkFormValues = {
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

export type NetworkFormProps = Pick<NetworkStepProps, 'onValuesChanged'>;

export type NetworkStepProps = {
  formRef: React.Ref<FormikProps<NetworkFormValues>>;
  onValuesChanged: (values: NetworkFormValues, initRender: boolean) => void;
  initialValues: NetworkFormValues;
  count: number;
};
