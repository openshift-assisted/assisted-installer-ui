import * as packageJson from '../../package.json';
import { Cluster, Host, Event, HostValidationId } from '../api/types';
import { ValidationsInfo, HostRole } from '../types/hosts';
import { OpenshiftVersionOptionType } from '../types/versions';

export let routeBasePath = '';
export const setRouteBasePath = (basePath: string) => {
  routeBasePath = basePath;
};

export const CLUSTER_MANAGER_SITE_LINK = 'https://cloud.redhat.com/openshift/install/pull-secret';
export const PULL_SECRET_INFO_LINK = CLUSTER_MANAGER_SITE_LINK;

// Used as a default before effective values are retrieved from the API
export const DEFAULT_OPENSHIFT_VERSION: OpenshiftVersionOptionType = {
  label: 'OpenShift 4.6',
  value: '4.6',
  supportLevel: 'production',
};

export const FEEDBACK_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfg9M8wRW4m_HkWeAl6KpB5dTcMu8iI3iJ29GlLfZpF2hnjng/viewform';

export const getOcpConsoleNodesPage = (ocpConsoleUrl: string) =>
  `${ocpConsoleUrl}/k8s/cluster/nodes`;

// TODO(mlibra): Retrieve branding dynamically, if needed, i.e. via injecting to the "window" object
export const getProductBrandingCode = () => 'redhat';

export const POLLING_INTERVAL = 10 * 1000;
export const EVENTS_POLLING_INTERVAL = 10 * 1000;

export const HOST_ROLES: HostRole[] = [
  {
    value: 'auto-assign',
    label: 'Automatic',
    description:
      'A role will be chosen automatically based on detected hardware and network latency.',
  },
  {
    value: 'master',
    label: 'Master',
    description: 'Runs the control plane components of OpenShift, including the API server.',
  },
  {
    value: 'worker',
    label: 'Worker',
    description:
      'Runs application workloads. Connect at least 5 hosts to enable dedicated workers.',
  },
];

export const CLUSTER_STATUS_LABELS: { [key in Cluster['status']]: string } = {
  'pending-for-input': 'Draft',
  insufficient: 'Draft',
  ready: 'Ready',
  'preparing-for-installation': 'Preparing for installation',
  installing: 'Installing',
  'installing-pending-user-action': 'Installing (pending action)',
  finalizing: 'Finalizing',
  cancelled: 'Installation cancelled',
  error: 'Error',
  installed: 'Installed',
  'adding-hosts': 'Adding hosts',
};

export const HOST_STATUS_LABELS: { [key in Host['status']]: string } = {
  discovering: 'Discovering',
  'pending-for-input': 'Pending input',
  known: 'Ready to install',
  disconnected: 'Disconnected',
  insufficient: 'Insufficient',
  disabled: 'Disabled',
  'preparing-for-installation': 'Preparing for installation',
  installing: 'Starting installation',
  'installing-in-progress': 'Installing',
  'installing-pending-user-action': 'Incorrect boot order',
  installed: 'Installed',
  cancelled: 'Installation cancelled',
  error: 'Error',
  resetting: 'Resetting',
  'resetting-pending-user-action': 'Reboot required',
  'added-to-existing-cluster': 'Installed',
};

export const CLUSTER_FIELD_LABELS: { [key in string]: string } = {
  name: 'Cluster Name',
  baseDnsDomain: 'Base DNS Domain',
  clusterNetworkCidr: 'Cluster Network CIDR',
  clusterNetworkHostPrefix: 'Cluster Network Host Prefix',
  serviceNetworkCidr: 'Service Network CIDR',
  apiVip: 'API Virtual IP',
  ingressVip: 'Ingress Virtual IP',
  pullSecret: 'Pull Secret',
  sshPublicKey: 'SSH Public Key',
};

export const HOST_STATUS_DETAILS: { [key in Host['status']]: string } = {
  discovering:
    'This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
  'pending-for-input': '',
  known:
    'This host meets the minimum hardware and networking requirements and will be included in the cluster.',
  disconnected:
    'This host has lost its connection to the installer and will not be included in the cluster unless connectivity is restored.',
  insufficient:
    'This host does not meet the minimum hardware or networking requirements and will not be included in the cluster.',
  disabled:
    'This host was manually disabled and will not be included in the cluster. Enable this host to include it again.',
  'preparing-for-installation': '',
  installing: '', // not rendered
  'installing-in-progress': '', // not rendered
  'installing-pending-user-action':
    "Please reconfigure this host's BIOS to boot from the disk where OpenShift was installed instead of the Discovery ISO.",
  installed: 'This host completed its installation successfully.',
  cancelled: 'This host installation has been cancelled.',
  error: 'This host failed its installation.',
  resetting: 'This host is resetting the installation.',
  'resetting-pending-user-action':
    'Host already booted from disk during previous installation. To finish resetting the installation please boot the host into Discovery ISO.',
  'added-to-existing-cluster': '', // special formatting
};

export const HOST_VALIDATION_GROUP_LABELS: { [key in keyof ValidationsInfo]: string } = {
  hardware: 'Hardware',
  network: 'Network',
  role: 'Roles',
};

export const HOST_VALIDATION_LABELS: { [key in HostValidationId]: string } = {
  'has-inventory': 'Hardware information',
  'has-min-cpu-cores': 'Minimum CPU cores',
  'has-min-memory': 'Minimum Memory',
  'has-min-valid-disks': 'Minimum disks of required size',
  'has-cpu-cores-for-role': 'Minimum CPU cores for selected role',
  'has-memory-for-role': 'Minimum memory for selected role',
  'hostname-unique': 'Unique hostname',
  'hostname-valid': 'Valid hostname',
  connected: 'Connected',
  'machine-cidr-defined': 'Machine CIDR',
  'belongs-to-machine-cidr': 'Belongs to machine CIDR',
  'role-defined': 'Role',
  'api-vip-connected': 'API VIP connected',
  'belongs-to-majority-group': 'Belongs to majority connected group',
  'valid-platform': 'Platform',
  'ntp-synced': 'NTP synchronization',
};

export const HOST_VALIDATION_FAILURE_HINTS: { [key in HostValidationId]: string } = {
  'has-inventory': '',
  'has-min-cpu-cores': '',
  'has-min-memory': '',
  'has-min-valid-disks': '',
  'has-cpu-cores-for-role': '',
  'has-memory-for-role': '',
  'hostname-unique': '',
  'hostname-valid': '',
  connected: '',
  'machine-cidr-defined': '',
  'belongs-to-machine-cidr': '',
  'role-defined': '',
  'api-vip-connected': '',
  'belongs-to-majority-group': '',
  'valid-platform': '',
  'ntp-synced':
    'Please manually fix hosts NTP configuration or provide Additional NTP source in Advanced networking configuration section.',
};

export const CLUSTER_DEFAULTS = {
  additionalNtpSource: undefined,
};

export const CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4 = {
  clusterNetworkCidr: '10.128.0.0/14',
  clusterNetworkHostPrefix: 23,
  serviceNetworkCidr: '172.30.0.0/16',
};

export const CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV6 = {
  clusterNetworkCidr: '2002:db8::/53',
  clusterNetworkHostPrefix: 64,
  serviceNetworkCidr: '2003:db8::/112',
};

export const getAssistedUiLibVersion = () => packageJson.version;

export const EVENT_SEVERITIES: Event['severity'][] = ['info', 'warning', 'error', 'critical'];

export const TIME_ZERO = '0001-01-01T00:00:00.000Z';

export const isSingleClusterMode = () => process.env.REACT_APP_BUILD_MODE === 'single-cluster';

export const NO_SUBNET_SET = 'NO_SUBNET_SET';

export const PREFIX_MAX_RESTRICTION = {
  IPv6: 128,
  IPv4: 25,
};
