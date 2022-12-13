import { InfraEnv } from '../api';

export type TrustedCertificateFieldsType = {
  enableCertificate: boolean;
  trustBundle?: InfraEnv['additionalTrustBundle'];
};
