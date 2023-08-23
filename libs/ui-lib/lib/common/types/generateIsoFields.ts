import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

export type ProxyFieldsType = {
  enableProxy: boolean;
  httpProxy?: Cluster['httpProxy'];
  httpsProxy?: Cluster['httpsProxy'];
  noProxy?: Cluster['noProxy'];
};

export type TrustedCertificateFieldsType = {
  enableCertificate: boolean;
  trustBundle?: InfraEnv['additionalTrustBundle'];
};
