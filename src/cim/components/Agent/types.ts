import { InfraEnvK8sResource } from '../../types';

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
  onCreate: (values: AddBmcValues, nmState?: any) => Promise<any>;
  hasDHCP: boolean;
  infraEnv: InfraEnvK8sResource;
};
