import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import { NMStateK8sResource } from '../../types/k8s/nm-state';

export type AddBmcValues = {
  hostname: string;
  bmcAddress: string;
  username: string;
  password: string;
  bootMACAddress: string;
  disableCertificateVerification: boolean;
  online: boolean;
  nmState: string;
  macMapping: { macAddress: string; name: string }[];
};

export type BMCFormProps = {
  onClose: VoidFunction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreate: (values: AddBmcValues, nmState?: NMStateK8sResource) => Promise<any>;
  hasDHCP: boolean;
  infraEnv: InfraEnvK8sResource;
  bmh?: BareMetalHostK8sResource;
  nmState?: NMStateK8sResource;
  secret?: SecretK8sResource;
  isEdit?: boolean;
};
