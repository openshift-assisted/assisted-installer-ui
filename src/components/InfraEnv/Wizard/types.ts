export type EnvironmentStepFormValues = {
  name: string;
  location: string;
  baseDomain: string;
  pullSecret: string;
  sshPublicKey: string;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  enableProxy: boolean;
  labels: string[];
  networks: { mac: string; config: string }[];
};
