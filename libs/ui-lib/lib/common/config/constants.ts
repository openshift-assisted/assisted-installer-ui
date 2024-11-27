import { TFunction } from 'i18next';
import { ValidationsInfo, HostRole } from '../types/hosts';
import {
  Cluster,
  ClusterValidationId,
  DiskRole,
  Event,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';
import { ValidationGroup as ClusterValidationGroup } from '../types/clusters';
import { FeatureSupportLevelData } from '../components/featureSupportLevels/FeatureSupportLevelContext';
import type { NewFeatureSupportLevelData } from '../components/newFeatureSupportLevels';
import buildManifest from '@openshift-assisted/ui-lib/package.json';

// TODO(mlibra): Retrieve branding dynamically, if needed, i.e. via injecting to the "window" object
export const getProductBrandingCode = () => 'redhat';

export const POLLING_INTERVAL = 10 * 1000;
export const EVENTS_POLLING_INTERVAL = 10 * 1000 * 6;

export const hostRoles = (t: TFunction): HostRole[] => [
  {
    value: 'auto-assign',
    label: t('ai:Auto-assign'),
    description: t(
      'ai:A role will be chosen automatically based on detected hardware and network latency.',
    ),
  },
  {
    value: 'master',
    label: t('ai:Control plane node'),
    description: t('ai:Runs the control plane components of OpenShift, including the API server.'),
  },
  {
    value: 'worker',
    label: t('ai:Worker'),
    description: t(
      'ai:Runs application workloads. Connect at least 5 hosts to enable dedicated workers.',
    ),
  },
];

export const clusterStatusLabels = (t: TFunction): { [key in Cluster['status']]: string } => ({
  'pending-for-input': t('ai:Draft'),
  insufficient: t('ai:Draft'),
  ready: t('ai:Draft'),
  'preparing-for-installation': t('ai:Preparing for installation'),
  installing: t('ai:Installing'),
  'installing-pending-user-action': t('ai:Installing (pending action)'),
  finalizing: t('ai:Finalizing'),
  cancelled: t('ai:Installation cancelled'),
  error: t('ai:Error'),
  installed: t('ai:Installed'),
  'adding-hosts': t('ai:Adding hosts'),
});

export const clusterFieldLabels = (t: TFunction): { [key in string]: string } => ({
  name: t('ai:Cluster name'),
  baseDnsDomain: t('ai:Base domain'),
  clusterNetworkCidr: t('ai:Cluster network CIDR'),
  clusterNetworkHostPrefix: t('ai:Cluster network host prefix'),
  serviceNetworkCidr: t('ai:Service network CIDR'),
  apiVips: t('ai:API IP'),
  ingressVips: t('ai:Ingress IP'),
  pullSecret: t('ai:Pull secret'),
  sshPublicKey: t('ai:SSH public key'),
  SNODisclaimer: t('ai:Single Node OpenShift disclaimer'),
  diskEncryptionTangServers: t("ai:Tang servers' URLs or thumbprints"),
  selectedHostIds: t('ai:Hosts selection'),
  httpProxy: t('ai:HTTP proxy'),
  httpsProxy: t('ai:HTTPS proxy'),
  noProxy: t('ai:No proxy'),
  machineNetworks: t('ai:Machine networks'),
  clusterNetworks: t('ai:Cluster networks'),
  serviceNetworks: t('ai:Service networks'),
});

export const hostValidationGroupLabels = (
  t: TFunction,
): { [key in keyof ValidationsInfo]: string } => ({
  hardware: t('ai:Hardware'),
  network: t('ai:Network'),
  operators: t('ai:Operators'),
  infrastructure: t('ai:Infrastructure'),
});

export const hostValidationLabels = (t: TFunction): { [key in HostValidationId]: string } => ({
  'compatible-with-cluster-platform': t('ai:Compatible with cluster platform'),
  'has-default-route': t('ai:Default route to host'),
  'sufficient-network-latency-requirement-for-role': t('ai:Network latency'),
  'sufficient-packet-loss-requirement-for-role': t('ai:Packet loss'),
  'has-inventory': t('ai:Hardware information'),
  'has-min-cpu-cores': t('ai:Minimum CPU cores'),
  'has-min-memory': t('ai:Minimum Memory'),
  'has-min-valid-disks': t('ai:Minimum disks of required size'),
  'has-cpu-cores-for-role': t('ai:Minimum CPU cores for selected role'),
  'has-memory-for-role': t('ai:Minimum memory for selected role'),
  'hostname-unique': t('ai:Unique hostname'),
  'hostname-valid': t('ai:Valid hostname'),
  connected: t('ai:Connected'),
  'media-connected': t('ai:Media Connected'),
  'machine-cidr-defined': t('ai:Machine CIDR'),
  'belongs-to-machine-cidr': t('ai:Belongs to machine CIDR'),
  'ignition-downloadable': t('ai:Ignition file downloadable'),
  'belongs-to-majority-group': t('ai:Belongs to majority connected group'),
  'valid-platform-network-settings': t('ai:Platform network settings'),
  'ntp-synced': t('ai:NTP synchronization'),
  'container-images-available': t('ai:Container images availability'),
  'lso-requirements-satisfied': t('ai:LSO requirements'),
  'ocs-requirements-satisfied': t('ai:OCS requirements'),
  'odf-requirements-satisfied': t('ai:ODF requirements'),
  'lvm-requirements-satisfied': t('ai:Logical Volume Manager requirements'),
  'cnv-requirements-satisfied': t('ai:CNV requirements'),
  'disk-encryption-requirements-satisfied': t('ai:Disk encryption requirements'),
  'sufficient-installation-disk-speed': t('ai:Installation disk speed'),
  'api-domain-name-resolved-correctly': t('ai:API domain name resolution'),
  'api-int-domain-name-resolved-correctly': t('ai:API internal domain name resolution'),
  'apps-domain-name-resolved-correctly': t('ai:Application ingress domain name resolution'),
  'release-domain-name-resolved-correctly': t('ai:Release domain resolution'),
  'dns-wildcard-not-configured': t('ai:DNS wildcard not configured'),
  'non-overlapping-subnets': t('ai:Non overlapping subnets'),
  'vsphere-disk-uuid-enabled': t('ai:Vsphere disk uuid enabled'),
  'compatible-agent': t('ai:Agent compatibility'),
  'no-skip-installation-disk': t('ai:No skip installation disk'),
  'no-skip-missing-disk': t('ai:No skip missing disk'),
  'time-synced-between-host-and-service': t('ai:Time synced between host and service'),
  'no-ip-collisions-in-network': t('ai:No IP collisions in network'),
  'mce-requirements-satisfied': t('ai:Multicluster engine requirements'),
  'mtv-requirements-satisfied': t('ai:Migration toolkit for virtualization requirements'),
  'no-iscsi-nic-belongs-to-machine-cidr': t('ai:iSCSI NIC belongs to machine CIDR'),
  'node-feature-discovery-requirements-satisfied': t('ai:Node Feature Discovery requirements'),
  'nvidia-gpu-requirements-satisfied': t('ai:NVIDIA GPU requirements'),
  'pipelines-requirements-satisfied': t('ai:Pipelines requirements'),
  'serverless-requirements-satisfied': t('ai:Serverless requirements'),
  'servicemesh-requirements-satisfied': t('ai:Service Mesh requirements'),
  'openshift-ai-requirements-satisfied': t('ai:OpenShift AI requirements'),
});

export const hostValidationFailureHints = (
  t: TFunction,
): { [key in HostValidationId]: string } => ({
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
  'media-connected': '',
  'machine-cidr-defined': '',
  'belongs-to-machine-cidr': '',
  'ignition-downloadable': '',
  'belongs-to-majority-group': '',
  'valid-platform-network-settings': '',
  'ntp-synced': t(
    "ai:Manually fix the host's NTP configuration or provide additional NTP sources.",
  ),
  'time-synced-between-host-and-service': '',
  'container-images-available': '',
  'lso-requirements-satisfied': '',
  'ocs-requirements-satisfied': '',
  'odf-requirements-satisfied': '',
  'lvm-requirements-satisfied': '',
  'cnv-requirements-satisfied': '',
  'disk-encryption-requirements-satisfied': '',
  'sufficient-installation-disk-speed': '',
  'api-domain-name-resolved-correctly': '',
  'api-int-domain-name-resolved-correctly': '',
  'apps-domain-name-resolved-correctly': '',
  'release-domain-name-resolved-correctly': '',
  'dns-wildcard-not-configured': '',
  'non-overlapping-subnets': '',
  'vsphere-disk-uuid-enabled': '',
  'compatible-agent': '',
  'no-skip-installation-disk': '',
  'no-skip-missing-disk': '',
  'no-ip-collisions-in-network': '',
  'mce-requirements-satisfied': '',
  'mtv-requirements-satisfied': '',
  'no-iscsi-nic-belongs-to-machine-cidr': '',
  'node-feature-discovery-requirements-satisfied': '',
  'nvidia-gpu-requirements-satisfied': '',
  'pipelines-requirements-satisfied': '',
  'serverless-requirements-satisfied': '',
  'servicemesh-requirements-satisfied': '',
  'openshift-ai-requirements-satisfied': '',
});

export const clusterValidationLabels = (
  t: TFunction,
): { [key in ClusterValidationId]?: string } => ({
  'network-type-valid': t('ai:Valid network type'),
  'machine-cidr-defined': t('ai:Machine CIDR'),
  'cluster-cidr-defined': t('ai:Cluster CIDR'),
  'service-cidr-defined': t('ai:Service CIDR'),
  'no-cidrs-overlapping': t('ai:No overlapping CIDR'),
  'networks-same-address-families': t('ai:Networks same address families'),
  'network-prefix-valid': t('ai:Valid network prefix'),
  'machine-cidr-equals-to-calculated-cidr': t('ai:Machine CIDR conforms expected'),
  'api-vips-defined': t('ai:API IP'),
  'api-vips-valid': t('ai:API IP validity'),
  'ingress-vips-defined': t('ai:Ingress IP'),
  'ingress-vips-valid': t('ai:Ingress IP validity'),
  'all-hosts-are-ready-to-install': t('ai:All hosts are ready to install'),
  'sufficient-masters-count': t('ai:Control plane nodes count'),
  'dns-domain-defined': t('ai:DNS domain'),
  'pull-secret-set': t('ai:Pull secret'),
  'ntp-server-configured': t('ai:NTP server'),
  'lso-requirements-satisfied': t('ai:LSO requirements'),
  'ocs-requirements-satisfied': t('ai:OCS requirements'),
  'odf-requirements-satisfied': t('ai:ODF requirements'),
  'lvm-requirements-satisfied': t('ai:Logical Volume Manager requirements'),
  'cnv-requirements-satisfied': t('ai:CNV requirements'),
  'mce-requirements-satisfied': t('ai:MCE requirements'),
  'platform-requirements-satisfied': t('ai:Platform requirements'),
});

export const clusterValidationGroupLabels = (
  t: TFunction,
): { [key in ClusterValidationGroup]: string } => ({
  configuration: t('ai:General configuration'),
  hostsData: t('ai:Hosts'),
  'hosts-data': t('ai:Hosts'),
  network: t('ai:Networking'),
  operators: t('ai:Operators'),
});

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

/**
 * The function returns the build-time generated version.
 * It can be overriden via the AIUI_APP_VERSION environment variable.
 */
export const getAssistedUiLibVersion = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return process.env.AIUI_APP_VERSION || buildManifest.version;
};

export const EVENT_SEVERITIES: Event['severity'][] = ['info', 'warning', 'error', 'critical'];

export const TIME_ZERO = '0001-01-01T00:00:00.000Z';

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const NO_SUBNET_SET = 'NO_SUBNET_SET';

export const NETWORK_TYPE_OVN = 'OVNKubernetes';
export const NETWORK_TYPE_SDN = 'OpenShiftSDN';

export const IPV4_STACK = 'singleStack';
export const DUAL_STACK = 'dualStack';

export const PREFIX_MAX_RESTRICTION = {
  IPv6: 128,
  IPv4: 25,
};

export const diskRoleLabels = (t: TFunction): { [key in DiskRole]: string } => ({
  none: t('ai:None'),
  install: t('ai:Installation disk'),
});

// The API uses free-form string for operator names, so let's guard at least using constants
export const OPERATOR_NAME_CNV = 'cnv';
export const OPERATOR_NAME_LSO = 'lso';
export const OPERATOR_NAME_ODF = 'odf';
export const OPERATOR_NAME_LVM = 'lvm';
export const OPERATOR_NAME_LVMS = 'lvms';
export const OPERATOR_NAME_MCE = 'mce';
export const OPERATOR_NAME_MTV = 'mtv';
export const OPERATOR_NAME_NODE_FEATURE_DISCOVERY = 'node-feature-discovery';
export const OPERATOR_NAME_NVIDIA_GPU = 'nvidia-gpu';
export const OPERATOR_NAME_PIPELINES = 'pipelines';
export const OPERATOR_NAME_SERVICEMESH = 'servicemesh';
export const OPERATOR_NAME_SERVERLESS = 'serverless';
export const OPERATOR_NAME_OPENSHIFT_AI = 'openshift-ai';

const OperatorNames = [
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_LVMS,
  OPERATOR_NAME_MCE,
  OPERATOR_NAME_MTV,
  OPERATOR_NAME_NODE_FEATURE_DISCOVERY,
  OPERATOR_NAME_NVIDIA_GPU,
  OPERATOR_NAME_PIPELINES,
  OPERATOR_NAME_SERVICEMESH,
  OPERATOR_NAME_SERVERLESS,
  OPERATOR_NAME_OPENSHIFT_AI,
];
export const ExposedOperatorNames = [
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_LVMS,
  OPERATOR_NAME_MCE,
  OPERATOR_NAME_MTV,
  OPERATOR_NAME_NODE_FEATURE_DISCOVERY,
  OPERATOR_NAME_NVIDIA_GPU,
  OPERATOR_NAME_PIPELINES,
  OPERATOR_NAME_SERVICEMESH,
  OPERATOR_NAME_SERVERLESS,
  OPERATOR_NAME_OPENSHIFT_AI,
];

export type OperatorName = (typeof OperatorNames)[number];
export type ExposedOperatorName = (typeof ExposedOperatorNames)[number];

export const operatorLabelsCim = (
  t: TFunction,
  openshiftVersion: Cluster['openshiftVersion'],
  featureSupportLevel: FeatureSupportLevelData,
): { [key in ExposedOperatorName]: string } => {
  const useLVMS =
    featureSupportLevel.getFeatureSupportLevel(openshiftVersion || '', 'LVM') === 'supported';

  return {
    [OPERATOR_NAME_ODF]: t('ai:OpenShift Data Foundation'),
    [OPERATOR_NAME_CNV]: t('ai:OpenShift Virtualization'),
    [OPERATOR_NAME_LVM]: useLVMS
      ? t('ai:Logical Volume Manager Storage')
      : t('ai:Logical Volume Manager'),
  };
};

export const operatorLabels = (
  t: TFunction,
  featureSupportLevel: NewFeatureSupportLevelData,
): { [key in ExposedOperatorName]: string } => {
  const useLVMS = featureSupportLevel.getFeatureSupportLevel('LVM') === 'supported';

  return {
    [OPERATOR_NAME_ODF]: t('ai:OpenShift Data Foundation'),
    [OPERATOR_NAME_CNV]: t('ai:OpenShift Virtualization'),
    [OPERATOR_NAME_LVM]: useLVMS
      ? t('ai:Logical Volume Manager Storage')
      : t('ai:Logical Volume Manager'),
    [OPERATOR_NAME_MCE]: t('ai:Multicluster engine'),
    [OPERATOR_NAME_NODE_FEATURE_DISCOVERY]: t('ai:Node Feature Discovery'),
    [OPERATOR_NAME_NVIDIA_GPU]: t('ai:NVIDIA GPU'),
    [OPERATOR_NAME_PIPELINES]: t('ai:Pipelines'),
    [OPERATOR_NAME_SERVICEMESH]: t('ai:Service Mesh'),
    [OPERATOR_NAME_SERVERLESS]: t('ai:Serverless'),
    [OPERATOR_NAME_OPENSHIFT_AI]: t('ai:OpenShift AI'),
  };
};

export const AI_UI_TAG = 'ui_ocm';

export const AI_ASSISTED_MIGRATION_TAG = 'assisted_migration';
