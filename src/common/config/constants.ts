import * as packageJson from '../../../package.json';

import { ValidationsInfo, HostRole } from '../../common/types/hosts';
import { Cluster, ClusterValidationId, DiskRole, Event, HostValidationId } from '../api';
import { ValidationGroup as ClusterValidationGroup } from '../types/clusters';

export const OPENSHIFT_LIFE_CYCLE_DATES_LINK =
  'https://access.redhat.com/support/policy/updates/openshift#dates';
export const OPENSHIFT_NETWORKING_DOCS_LINK =
  'https://docs.openshift.com/container-platform/4.7/installing/installing_bare_metal/installing-bare-metal.html#installation-network-user-infra_installing-bare-metal';
export const CLUSTER_MANAGER_SITE_LINK = 'https://console.redhat.com/openshift/install/pull-secret';
export const PULL_SECRET_INFO_LINK = CLUSTER_MANAGER_SITE_LINK;
export const ODF_REQUIREMENTS_LINK =
  'https://access.redhat.com/documentation/en-us/red_hat_openshift_data_foundation/4.9/html/planning_your_deployment/infrastructure-requirements_rhodf#resource-requirements_rhodf';
export const VSPHERE_CONFIG_LINK = 'https://access.redhat.com/solutions/6677901';

export const getBugzillaLink = (version = '') =>
  `https://bugzilla.redhat.com/enter_bug.cgi?product=OpenShift%20Container%20Platform&Component=OpenShift%20Container%20Platform&component=assisted-installer&version=${version}`;

export const FEEDBACK_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfg9M8wRW4m_HkWeAl6KpB5dTcMu8iI3iJ29GlLfZpF2hnjng/viewform';

export const TECH_SUPPORT_LEVEL_LINK = 'https://access.redhat.com/support/offerings/techpreview';

export const ENCRYPTING_DISK_DURING_INSTALLATION =
  'https://docs.openshift.com/container-platform/4.7/installing/install_config/installing-customizing.html#installation-special-config-encrypt-disk_installing-customizing';

export const getOcpConsoleNodesPage = (ocpConsoleUrl: string) =>
  `${ocpConsoleUrl}/k8s/cluster/nodes`;

export const REDHAT_CONSOLE_OPENSHIFT = 'https://console.redhat.com/openshift';

// TODO(mlibra): Retrieve branding dynamically, if needed, i.e. via injecting to the "window" object
export const getProductBrandingCode = () => 'redhat';

export const POLLING_INTERVAL = 10 * 1000;
export const EVENTS_POLLING_INTERVAL = 10 * 1000;

export const HOST_ROLES: HostRole[] = [
  {
    value: 'auto-assign',
    label: 'Auto-assign',
    description:
      'A role will be chosen automatically based on detected hardware and network latency.',
  },
  {
    value: 'master',
    label: 'Control plane node',
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
  ready: 'Draft',
  'preparing-for-installation': 'Preparing for installation',
  installing: 'Installing',
  'installing-pending-user-action': 'Installing (pending action)',
  finalizing: 'Finalizing',
  cancelled: 'Installation cancelled',
  error: 'Error',
  installed: 'Installed',
  'adding-hosts': 'Adding hosts',
};

export const CLUSTER_FIELD_LABELS: { [key in string]: string } = {
  name: 'Cluster name',
  baseDnsDomain: 'Base domain',
  clusterNetworkCidr: 'Cluster network CIDR',
  clusterNetworkHostPrefix: 'Cluster network host prefix',
  serviceNetworkCidr: 'Service network CIDR',
  apiVip: 'API Virtual IP',
  ingressVip: 'Ingress Virtual IP',
  pullSecret: 'Pull secret',
  sshPublicKey: 'SSH public key',
  SNODisclaimer: 'Single Node OpenShift disclaimer',
  diskEncryptionTangServers: "Tang servers' URLs or thumbprints",
  selectedHostIds: 'Hosts selection',
  httpProxy: 'HTTP proxy',
  httpsProxy: 'HTTPS proxy',
  noProxy: 'No proxy',
};

export const HOST_VALIDATION_GROUP_LABELS: { [key in keyof ValidationsInfo]: string } = {
  hardware: 'Hardware',
  network: 'Network',
  operators: 'Operators',
  infrastructure: 'Infrastructure',
};

export const HOST_VALIDATION_LABELS: { [key in HostValidationId]: string } = {
  'odf-requirements-satisfied': 'ODF requirements',
  'disk-encryption-requirements-satisfied': 'Disk encryption requirements',
  'compatible-with-cluster-platform': '',
  'has-default-route': 'Default route to host',
  'sufficient-network-latency-requirement-for-role': 'Network latency',
  'sufficient-packet-loss-requirement-for-role': 'Packet loss',
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
  'ignition-downloadable': 'Ignition file downloadable',
  'belongs-to-majority-group': 'Belongs to majority connected group',
  'valid-platform-network-settings': 'Platform network settings',
  'ntp-synced': 'NTP synchronization',
  'container-images-available': 'Container images availability',
  'lso-requirements-satisfied': 'LSO requirements',
  'ocs-requirements-satisfied': 'OCS requirements',
  'sufficient-installation-disk-speed': 'Installation disk speed',
  'cnv-requirements-satisfied': 'CNV requirements',
  'api-domain-name-resolved-correctly': 'API domain name resolution',
  'api-int-domain-name-resolved-correctly': 'API internal domain name resolution',
  'apps-domain-name-resolved-correctly': 'Application ingress domain name resolution',
  'dns-wildcard-not-configured': 'DNS wildcard not configured',
};

export const HOST_VALIDATION_FAILURE_HINTS: { [key in HostValidationId]: string } = {
  'odf-requirements-satisfied': '',
  'disk-encryption-requirements-satisfied': '',
  'compatible-with-cluster-platform': '',
  'has-default-route': '',
  'sufficient-network-latency-requirement-for-role': '',
  'sufficient-packet-loss-requirement-for-role': '',
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
  'ignition-downloadable': '',
  'belongs-to-majority-group': '',
  'valid-platform-network-settings': '',
  'ntp-synced': "Please manually fix host's NTP configuration or provide additional NTP sources.",
  'container-images-available': '',
  'lso-requirements-satisfied': '',
  'ocs-requirements-satisfied': '',
  'sufficient-installation-disk-speed': '',
  'cnv-requirements-satisfied': '',
  'api-domain-name-resolved-correctly': '',
  'api-int-domain-name-resolved-correctly': '',
  'apps-domain-name-resolved-correctly': '',
  'dns-wildcard-not-configured': '',
};

export const CLUSTER_VALIDATION_LABELS: { [key in ClusterValidationId]: string } = {
  'odf-requirements-satisfied': 'ODF requirements',
  'network-type-valid': 'Valid network type',
  'machine-cidr-defined': 'Machine CIDR',
  'cluster-cidr-defined': 'Cluster CIDR',
  'service-cidr-defined': 'Service CIDR',
  'no-cidrs-overlapping': 'No overlapping CIDR',
  'network-prefix-valid': 'Valid network prefix',
  'machine-cidr-equals-to-calculated-cidr': 'Machine CIDR conforms expected',
  'api-vip-defined': 'API VIP',
  'api-vip-valid': 'API VIP validity',
  'ingress-vip-defined': 'Ingress VIP',
  'ingress-vip-valid': 'Ingress VIP validity',
  'all-hosts-are-ready-to-install': 'All hosts are ready to install',
  'sufficient-masters-count': 'Control plane nodes count',
  'dns-domain-defined': 'DNS domain',
  'pull-secret-set': 'Pull secret',
  'ntp-server-configured': 'NTP server',
  'lso-requirements-satisfied': 'LSO requirements',
  'ocs-requirements-satisfied': 'OCS requirements',
  'cnv-requirements-satisfied': 'CNV requirements',
};

export const CLUSTER_VALIDATION_GROUP_LABELS: { [key in ClusterValidationGroup]: string } = {
  configuration: 'General configuration',
  hostsData: 'Hosts',
  'hosts-data': 'Hosts',
  network: 'Networking',
  operators: 'Operators',
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

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const NO_SUBNET_SET = 'NO_SUBNET_SET';

export const PREFIX_MAX_RESTRICTION = {
  IPv6: 128,
  IPv4: 25,
};

export const DISK_ROLE_LABELS: { [key in DiskRole]: string } = {
  none: 'None',
  install: 'Installation disk',
};

export const SNO_SUPPORT_MIN_VERSION = 4.8;

// The API uses free-form string for operator names, so let's gueard at least using constants
export const OPERATOR_NAME_CNV = 'cnv';
export const OPERATOR_NAME_LSO = 'lso';
export const OPERATOR_NAME_OCS = 'ocs'; // TODO(jkilzi): Remove once OCS is replaced by ODF
export const OPERATOR_NAME_ODF = 'odf';
export const OPERATOR_NAME_CVO = 'cvo';
export const OPERATOR_NAME_CONSOLE = 'console';

export const OPERATOR_LABELS = {
  [OPERATOR_NAME_CONSOLE]: 'OpenShift Console',
  [OPERATOR_NAME_CVO]: 'OpenShift Cluster Version Operator',
  [OPERATOR_NAME_LSO]: 'OpenShift Local Storage',
  [OPERATOR_NAME_OCS]: 'OpenShift Container Storage', // TODO(jkilzi): Remove once OCS is replaced by ODF
  [OPERATOR_NAME_ODF]: 'OpenShift Data Foundation',
  [OPERATOR_NAME_CNV]: 'OpenShift Virtualization',
};

export const OCP_STATIC_IP_DOC =
  'https://docs.openshift.com/container-platform/latest/scalability_and_performance/ztp-deploying-disconnected.html#ztp-configuring-a-static-ip_ztp-deploying-disconnected';
