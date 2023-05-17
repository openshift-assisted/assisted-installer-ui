/* eslint-disable @typescript-eslint/naming-convention */

const hostReadyValidationsInfo = (hostName) => ({
  hardware: [
    {
      id: 'has-inventory',
      status: 'success',
      message: 'Valid inventory exists for the host',
    },
    {
      id: 'has-min-cpu-cores',
      status: 'success',
      message: 'Sufficient CPU cores',
    },
    {
      id: 'has-min-memory',
      status: 'success',
      message: 'Sufficient minimum RAM',
    },
    {
      id: 'has-min-valid-disks',
      status: 'success',
      message: 'Sufficient disk capacity',
    },
    {
      id: 'has-cpu-cores-for-role',
      status: 'success',
      message: 'Sufficient CPU cores for role master',
    },
    {
      id: 'has-memory-for-role',
      status: 'success',
      message: 'Sufficient RAM for role master',
    },
    {
      id: 'hostname-unique',
      status: 'success',
      message: `Hostname ${hostName} is unique in cluster`,
    },
    {
      id: 'hostname-valid',
      status: 'success',
      message: `Hostname ${hostName} is allowed`,
    },
  ],
  network: [
    {
      id: 'connected',
      status: 'success',
      message: 'Host is connected',
    },
    {
      id: 'machine-cidr-defined',
      status: 'success',
      message: 'No Machine Network CIDR needed: User Managed Networking',
    },
    {
      id: 'belongs-to-machine-cidr',
      status: 'pending',
      message: 'Missing inventory or machine network CIDR',
    },
    {
      id: 'belongs-to-majority-group',
      status: 'success',
      message: 'Host has connectivity to the majority of hosts in the cluster',
    },
    {
      id: 'valid-platform-network-settings',
      status: 'success',
      message: 'Platform KVM is allowed',
    },
    {
      id: 'ntp-synced',
      status: 'success',
      message: 'Host could synchronize with the NTP server.',
    },
  ],
  operators: [
    {
      id: 'cnv-requirements-satisfied',
      status: 'success',
      message: 'cnv is disabled',
    },
    {
      id: 'lso-requirements-satisfied',
      status: 'success',
      message: 'lso is disabled',
    },
    {
      id: 'odf-requirements-satisfied',
      status: 'success',
      message: 'odf is disabled',
    },
    {
      id: 'lvm-requirements-satisfied',
      status: 'success',
      message: 'lvm is disabled',
    },
  ],
});

const hostReady = (originalHost) => {
  const allValidations = hostReadyValidationsInfo(originalHost.requested_hostname);
  return {
    ...originalHost,
    validations_info: JSON.stringify(allValidations),
  };
};

export { hostReady };
