export interface AddHostsClusterCreateParams {
  /**
   * Unique identifier of the object.
   */
  id: string; // uuid
  /**
   * Name of the OpenShift cluster.
   */
  name: string;
  /**
   * api vip domain.
   */
  apiVipDnsname: string;
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: string;
}
export interface ApiVipConnectivityRequest {
  /**
   * URL address of the API.
   */
  url: string;
  /**
   * Whether to verify if the API VIP belongs to one of the interfaces (DEPRECATED).
   */
  verifyCidr?: boolean;
  /**
   * A CA certficate to be used when contacting the URL via https.
   */
  caCertificate?: string;
  /**
   * A string which will be used as Authorization Bearer token to fetch the ignition from ignitionEndpointUrl.
   */
  ignitionEndpointToken?: string;
}
export interface ApiVipConnectivityResponse {
  /**
   * API VIP connectivity check result.
   */
  isSuccess?: boolean;
  /**
   * Ignition fetched from the specified API VIP
   */
  ignition?: string;
}
export interface AssistedServiceIsoCreateParams {
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion?: string;
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret?: string;
}
export interface BindHostParams {
  clusterId: string; // uuid
}
export interface Boot {
  currentBootMode?: string;
  pxeInterface?: string;
}
export interface Cluster {
  /**
   * Indicates the type of this object. Will be 'Cluster' if this is a complete object,
   * 'AddHostsCluster' for cluster that add hosts to existing OCP cluster,
   *
   */
  kind: 'Cluster' | 'AddHostsCluster';
  /**
   * Guaranteed availability of the installed cluster. 'Full' installs a Highly-Available cluster
   * over multiple master nodes whereas 'None' installs a full cluster over one node.
   *
   */
  highAvailabilityMode?: 'Full' | 'None';
  /**
   * Unique identifier of the object.
   */
  id: string; // uuid
  /**
   * Self link.
   */
  href: string;
  /**
   * Name of the OpenShift cluster.
   */
  name?: string;
  userName?: string;
  orgId?: string;
  emailDomain?: string;
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion?: string;
  /**
   * OpenShift release image URI.
   */
  ocpReleaseImage?: string;
  /**
   * Cluster ID on OCP system.
   */
  openshiftClusterId?: string; // uuid
  imageInfo: ImageInfo;
  platform?: Platform;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated. This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The virtual IP used to reach the OpenShift cluster's API.
   */
  apiVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))$
  /**
   * The domain name used to reach the OpenShift cluster API.
   */
  apiVipDnsName?: string;
  /**
   * A CIDR that all hosts belonging to the cluster should have an interfaces with IP address that belongs to this CIDR. The apiVip belongs to this CIDR.
   */
  machineNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))$
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * A proxy URL to use for creating HTTP connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpProxy?: string;
  /**
   * A proxy URL to use for creating HTTPS connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpsProxy?: string;
  /**
   * A comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude from proxying.
   */
  noProxy?: string;
  /**
   * Status of the OpenShift cluster.
   */
  status:
    | 'insufficient'
    | 'ready'
    | 'error'
    | 'preparing-for-installation'
    | 'pending-for-input'
    | 'installing'
    | 'finalizing'
    | 'installed'
    | 'adding-hosts'
    | 'cancelled'
    | 'installing-pending-user-action';
  /**
   * Additional information pertaining to the status of the OpenShift cluster.
   */
  statusInfo: string;
  /**
   * The last time that the cluster status was updated.
   */
  statusUpdatedAt?: string; // date-time
  /**
   * Installation progress percentages of the cluster.
   */
  progress?: ClusterProgressInfo;
  /**
   * Information regarding hosts' installation disks encryption.
   */
  diskEncryption?: DiskEncryption;
  /**
   * Hosts that are associated with this cluster.
   */
  hosts?: Host[];
  /**
   * hosts associated to this cluster that are in 'known' state.
   */
  readyHostCount?: number; // int64
  /**
   * hosts associated to this cluster that are not in 'disabled' state.
   */
  enabledHostCount?: number; // int64
  /**
   * All hosts associated to this cluster.
   */
  totalHostCount?: number; // int64
  /**
   * Schedule workloads on masters
   */
  schedulableMasters?: boolean;
  /**
   * The last time that this cluster was updated.
   */
  updatedAt?: string; // date-time
  /**
   * The time that this cluster was created.
   */
  createdAt?: string; // date-time
  /**
   * The time that this cluster started installation.
   */
  installStartedAt?: string; // date-time
  /**
   * The time that this cluster completed installation.
   */
  installCompletedAt?: string; // date-time
  /**
   * List of host networks to be filled during query.
   */
  hostNetworks?: HostNetwork[];
  /**
   * True if the pull secret has been added to the cluster.
   */
  pullSecretSet?: boolean;
  /**
   * Indicate if virtual IP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
  /**
   * JSON-formatted string containing the validation results for each validation id grouped by category (network, hosts-data, etc.)
   */
  validationsInfo?: string;
  /**
   * The progress of log collection or empty if logs are not applicable
   */
  logsInfo?: LogsState;
  /**
   * JSON-formatted string containing the user overrides for the install-config.yaml file.
   * example:
   * {"networking":{"networkType": "OVNKubernetes"},"fips":true}
   */
  installConfigOverrides?: string;
  /**
   * Json formatted string containing the user overrides for the initial ignition config
   * example:
   * {"ignition": {"version": "3.1.0"}, "storage": {"files": [{"path": "/tmp/example", "contents": {"source": "data:text/plain;base64,aGVscGltdHJhcHBlZGluYXN3YWdnZXJzcGVj"}}]}}
   */
  ignitionConfigOverrides?: string;
  controllerLogsCollectedAt?: string; // date-time
  controllerLogsStartedAt?: string; // date-time
  /**
   * Json formatted string containing the majority groups for connectivity checks.
   */
  connectivityMajorityGroups?: string;
  /**
   * swagger:ignore
   */
  deletedAt?: unknown;
  /**
   * Indicate if the networking is managed by the user.
   */
  userManagedNetworking?: boolean;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSource?: string;
  /**
   * Operators that are associated with this cluster.
   */
  monitoredOperators?: MonitoredOperator[];
  /**
   * Unique identifier of the AMS subscription in OCM.
   */
  amsSubscriptionId?: string; // uuid
  /**
   * Enable/disable hyperthreading on master nodes, worker nodes, or all nodes
   */
  hyperthreading?: 'masters' | 'workers' | 'all' | 'none';
  /**
   * JSON-formatted string containing the usage information by feature name
   */
  featureUsage?: string;
  /**
   * The desired network type used.
   */
  networkType?: 'OpenShiftSDN' | 'OVNKubernetes';
  /**
   * Cluster networks that are associated with this cluster.
   */
  clusterNetworks?: ClusterNetwork[];
  /**
   * Service networks that are associated with this cluster.
   */
  serviceNetworks?: ServiceNetwork[];
  /**
   * Machine networks that are associated with this cluster.
   */
  machineNetworks?: MachineNetwork[];
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture?: string;
  /**
   * Explicit ignition endpoint overrides the default ignition endpoint.
   */
  ignitionEndpoint?: IgnitionEndpoint;
}
export interface ClusterCreateParams {
  /**
   * Name of the OpenShift cluster.
   */
  name: string;
  /**
   * Guaranteed availability of the installed cluster. 'Full' installs a Highly-Available cluster
   * over multiple master nodes whereas 'None' installs a full cluster over one node.
   *
   */
  highAvailabilityMode?: 'Full' | 'None';
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: string;
  /**
   * OpenShift release image URI.
   */
  ocpReleaseImage?: string;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated. This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))$
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret: string;
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Indicate if virtual IP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
  /**
   * A proxy URL to use for creating HTTP connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpProxy?: string;
  /**
   * A proxy URL to use for creating HTTPS connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpsProxy?: string;
  /**
   * An "*" or a comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude from proxying.
   */
  noProxy?: string;
  /**
   * Indicate if the networking is managed by the user.
   */
  userManagedNetworking?: boolean;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSource?: string;
  /**
   * List of OLM operators to be installed.
   */
  olmOperators?: OperatorCreateParams[];
  /**
   * Enable/disable hyperthreading on master nodes, worker nodes, or all nodes.
   */
  hyperthreading?: 'masters' | 'workers' | 'none' | 'all';
  /**
   * The desired network type used.
   */
  networkType?: 'OpenShiftSDN' | 'OVNKubernetes';
  /**
   * Schedule workloads on masters
   */
  schedulableMasters?: boolean;
  /**
   * Cluster networks that are associated with this cluster.
   */
  clusterNetworks?: ClusterNetwork[];
  /**
   * Service networks that are associated with this cluster.
   */
  serviceNetworks?: ServiceNetwork[];
  /**
   * Machine networks that are associated with this cluster.
   */
  machineNetworks?: MachineNetwork[];
  platform?: Platform;
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture?: string;
  /**
   * Installation disks encryption mode and host roles to be applied.
   */
  diskEncryption?: DiskEncryption;
  /**
   * Explicit ignition endpoint overrides the default ignition endpoint.
   */
  ignitionEndpoint?: IgnitionEndpoint;
}
export interface ClusterDefaultConfig {
  clusterNetworkCidr?: string; // ^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\/]([1-9]|[1-2][0-9]|3[0-2]?)$
  clusterNetworkHostPrefix?: number;
  inactiveDeletionHours?: number;
  serviceNetworkCidr?: string; // ^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)[\/]([1-9]|[1-2][0-9]|3[0-2]?)$
  ntpSource?: string;
}
export interface ClusterHostRequirements {
  /**
   * Unique identifier of the host the requirements relate to.
   */
  hostId?: string; // uuid
  /**
   * Total host requirements for the cluster configuration
   */
  total?: ClusterHostRequirementsDetails;
  /**
   * Host requirements for the OCP installation
   */
  ocp?: ClusterHostRequirementsDetails;
  /**
   * Host requirements related to requested operators
   */
  operators?: OperatorHostRequirements[];
}
export interface ClusterHostRequirementsDetails {
  /**
   * Required number of CPU cores
   */
  cpuCores?: number;
  /**
   * Required number of RAM in MiB
   */
  ramMib?: number;
  /**
   * Required disk size in GB
   */
  diskSizeGb?: number;
  /**
   * Required installation disk speed in ms
   */
  installationDiskSpeedThresholdMs?: number;
  /**
   * Maximum network average latency (RTT) at L3 for role.
   */
  networkLatencyThresholdMs?: number; // double
  /**
   * Maximum packet loss allowed at L3 for role.
   */
  packetLossPercentage?: number; // double
  /**
   * Whether TPM module should be enabled in host's BIOS.
   */
  tpmEnabledInBios?: boolean;
}
export type ClusterHostRequirementsList = ClusterHostRequirements[];
export type ClusterList = Cluster[];
/**
 * IP address block for pod IP blocks.
 */
export interface ClusterNetwork {
  /**
   * The cluster that this network is associated with.
   */
  clusterId?: string; // uuid
  /**
   * The IP block address pool.
   */
  cidr?: Subnet; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The prefix size to allocate to each node from the CIDR. For example, 24 would allocate 2^8=256 adresses to each node.
   */
  hostPrefix?: number;
}
export interface ClusterProgressInfo {
  totalPercentage?: number;
  preparingForInstallationStagePercentage?: number;
  installingStagePercentage?: number;
  finalizingStagePercentage?: number;
}
export interface ClusterUpdateParams {
  /**
   * OpenShift cluster name.
   */
  name?: string;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated. This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  platform?: Platform;
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The virtual IP used to reach the OpenShift cluster's API.
   */
  apiVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))?$
  /**
   * The virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))?$
  /**
   * The domain name used to reach the OpenShift cluster API.
   */
  apiVipDnsName?: string;
  /**
   * A CIDR that all hosts belonging to the cluster should have an interfaces with IP address that belongs to this CIDR. The apiVip belongs to this CIDR.
   */
  machineNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret?: string;
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Indicate if virtual IP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
  /**
   * A proxy URL to use for creating HTTP connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpProxy?: string;
  /**
   * A proxy URL to use for creating HTTPS connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpsProxy?: string;
  /**
   * An "*" or a comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude from proxying.
   */
  noProxy?: string;
  /**
   * The desired role for hosts associated with the cluster.
   */
  hostsRoles?: {
    id?: string; // uuid
    role?: HostRoleUpdateParams;
  }[];
  /**
   * The desired hostname for hosts associated with the cluster.
   */
  hostsNames?: {
    id?: string; // uuid
    hostname?: string;
  }[];
  disksSelectedConfig?: {
    id?: string; // uuid
    /**
     * The desired disks parameters (such as the disk's role).
     */
    disksConfig?: DiskConfigParams[];
  }[];
  /**
   * The desired machine config pool for hosts associated with the cluster.
   */
  hostsMachineConfigPoolNames?: {
    id?: string; // uuid
    machineConfigPoolName?: string;
  }[];
  /**
   * Indicate if the networking is managed by the user.
   */
  userManagedNetworking?: boolean;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSource?: string;
  /**
   * List of OLM operators to be installed.
   */
  olmOperators?: OperatorCreateParams[];
  /**
   * Enable/disable hyperthreading on master nodes, worker nodes, or all nodes.
   */
  hyperthreading?: 'masters' | 'workers' | 'all' | 'none';
  /**
   * The desired network type used.
   */
  networkType?: 'OpenShiftSDN' | 'OVNKubernetes';
  /**
   * Schedule workloads on masters
   */
  schedulableMasters?: boolean;
  /**
   * Cluster networks that are associated with this cluster.
   */
  clusterNetworks?: ClusterNetwork[];
  /**
   * Service networks that are associated with this cluster.
   */
  serviceNetworks?: ServiceNetwork[];
  /**
   * Machine networks that are associated with this cluster.
   */
  machineNetworks?: MachineNetwork[];
  /**
   * Installation disks encryption mode and host roles to be applied.
   */
  diskEncryption?: DiskEncryption;
  /**
   * Explicit ignition endpoint overrides the default ignition endpoint.
   */
  ignitionEndpoint?: IgnitionEndpoint;
}
export type ClusterValidationId =
  | 'machine-cidr-defined'
  | 'cluster-cidr-defined'
  | 'service-cidr-defined'
  | 'no-cidrs-overlapping'
  | 'network-prefix-valid'
  | 'machine-cidr-equals-to-calculated-cidr'
  | 'api-vip-defined'
  | 'api-vip-valid'
  | 'ingress-vip-defined'
  | 'ingress-vip-valid'
  | 'all-hosts-are-ready-to-install'
  | 'sufficient-masters-count'
  | 'dns-domain-defined'
  | 'pull-secret-set'
  | 'ntp-server-configured'
  | 'lso-requirements-satisfied'
  | 'ocs-requirements-satisfied'
  | 'cnv-requirements-satisfied'
  | 'network-type-valid';
export interface CompletionParams {
  isSuccess: boolean;
  errorInfo?: string;
}
export interface ConnectivityCheckHost {
  hostId?: string; // uuid
  nics?: ConnectivityCheckNic[];
}
export interface ConnectivityCheckNic {
  name?: string;
  mac?: string;
  ipAddresses?: string[];
}
export type ConnectivityCheckParams = ConnectivityCheckHost[];
export interface ConnectivityRemoteHost {
  hostId?: string; // uuid
  l2Connectivity?: L2Connectivity[];
  l3Connectivity?: L3Connectivity[];
}
export interface ConnectivityReport {
  remoteHosts?: ConnectivityRemoteHost[];
}
export interface ContainerImageAvailability {
  /**
   * A fully qualified image name (FQIN).
   */
  name?: string;
  /**
   * Size of the image in bytes.
   */
  sizeBytes?: number;
  /**
   * Seconds it took to pull the image.
   */
  time?: number;
  /**
   * The rate of size/time in seconds MBps.
   */
  downloadRate?: number;
  result?: ContainerImageAvailabilityResult;
}
export interface ContainerImageAvailabilityRequest {
  /**
   * Positive number represents a timeout in seconds for a pull operation.
   */
  timeout?: number;
  /**
   * List of image names to be checked.
   */
  images: string[];
}
export interface ContainerImageAvailabilityResponse {
  /**
   * List of images that were checked.
   */
  images: ContainerImageAvailability[];
}
/**
 * Image availability result.
 */
export type ContainerImageAvailabilityResult = 'success' | 'failure';
export interface Cpu {
  count?: number;
  frequency?: number;
  flags?: string[];
  modelName?: string;
  architecture?: string;
}
export interface CreateManifestParams {
  /**
   * The folder that contains the files. Manifests can be placed in 'manifests' or 'openshift' directories.
   */
  folder?: 'manifests' | 'openshift';
  /**
   * The name of the manifest to customize the installed OCP cluster.
   */
  fileName: string; // ^[^/]*\.(yaml|yml|json)$
  /**
   * base64 encoded manifest content.
   */
  content: string;
}
export interface Credentials {
  username?: string;
  password?: string;
  consoleUrl?: string;
}
export interface DhcpAllocationRequest {
  /**
   * The network interface (NIC) to run the DHCP requests on.
   */
  interface: string;
  /**
   * MAC address for the API virtual IP.
   */
  apiVipMac: string; // mac
  /**
   * MAC address for the Ingress virtual IP.
   */
  ingressVipMac: string; // mac
  /**
   * Contents of lease file to be used for API virtual IP.
   */
  apiVipLease?: string;
  /**
   * Contents of lease file to be used for for Ingress virtual IP.
   */
  ingressVipLease?: string;
}
export interface DhcpAllocationResponse {
  /**
   * The IPv4 address that was allocated by DHCP for the API virtual IP.
   */
  apiVipAddress: string; // ipv4
  /**
   * The IPv4 address that was allocated by DHCP for the Ingress virtual IP.
   */
  ingressVipAddress: string; // ipv4
  /**
   * Contents of last acquired lease for API virtual IP.
   */
  apiVipLease?: string;
  /**
   * Contents of last acquired lease for Ingress virtual IP.
   */
  ingressVipLease?: string;
}
export interface DiscoveryIgnitionParams {
  config?: string;
}
export interface Disk {
  /**
   * Determine the disk's unique identifier which is the by-id field if it exists and fallback to the by-path field otherwise
   */
  id?: string;
  driveType?: string;
  vendor?: string;
  name?: string;
  path?: string;
  hctl?: string;
  /**
   * by-path is the shortest physical path to the device
   */
  byPath?: string;
  /**
   * by-id is the World Wide Number of the device which guaranteed to be unique for every storage device
   */
  byId?: string;
  model?: string;
  wwn?: string;
  serial?: string;
  sizeBytes?: number;
  bootable?: boolean;
  removable?: boolean;
  /**
   * Whether the disk appears to be an installation media or not
   */
  isInstallationMedia?: boolean;
  installationEligibility?: {
    /**
     * Whether the disk is eligible for installation or not.
     */
    eligible?: boolean;
    /**
     * Reasons for why this disk is not eligible for installation.
     */
    notEligibleReasons?: string[];
  };
  smart?: string;
  ioPerf?: IoPerf;
}
export interface DiskConfigParams {
  id: string;
  role?: DiskRole;
}
export interface DiskEncryption {
  /**
   * Enable/disable disk encryption on master nodes, worker nodes, or all nodes.
   */
  enableOn?: 'none' | 'all' | 'masters' | 'workers';
  /**
   * The disk encryption mode to use.
   */
  mode?: 'tpmv2' | 'tang';
  /**
   * JSON-formatted string containing additional information regarding tang's configuration
   * example:
   * [{"url":"http://tang.example.com:7500","thumbprint":"PLjNyRdGw03zlRoGjQYMahSZGu9"}, {"url":"http://tang.example.com:7501","thumbprint":"PLjNyRdGw03zlRoGjQYMahSZGu8"}]
   */
  tangServers?: string;
}
export interface DiskInfo {
  id?: string; // uuid
  path?: string;
  diskSpeed?: DiskSpeed;
}
export type DiskRole = 'none' | 'install';
export interface DiskSpeed {
  tested?: boolean;
  exitCode?: number;
  speedMs?: number;
}
export interface DiskSpeedCheckRequest {
  /**
   * --filename argument for fio (expects a file or a block device path).
   */
  path: string;
}
export interface DiskSpeedCheckResponse {
  /**
   * The 99th percentile of fdatasync durations in milliseconds.
   */
  ioSyncDuration?: number;
  /**
   * The device path.
   */
  path?: string;
}
export interface DomainResolutionRequest {
  domains: {
    /**
     * The domain name that should be resolved
     */
    domainName: string;
  }[];
}
export interface DomainResolutionResponse {
  resolutions: {
    /**
     * The domain that was resolved
     */
    domainName: string;
    /**
     * The IPv4 addresses of the domain, empty if none
     */
    ipv4Addresses?: string /* ipv4 */[];
    /**
     * The IPv6 addresses of the domain, empty if none
     */
    ipv6Addresses?: string /* ipv6 */[];
  }[];
}
export interface Error {
  /**
   * Indicates the type of this object. Will always be 'Error'.
   */
  kind: 'Error';
  /**
   * Numeric identifier of the error.
   */
  id: number; // int32
  /**
   * Self link.
   */
  href: string;
  /**
   * Globally unique code of the error, composed of the unique identifier of the API and the numeric identifier of the error. For example, if the numeric identifier of the error is 93 and the identifier of the API is assistedInstall then the code will be ASSISTED-INSTALL-93.
   */
  code: string;
  /**
   * Human-readable description of the error.
   */
  reason: string;
}
export interface Event {
  /**
   * Unique identifier of the cluster this event relates to.
   */
  clusterId?: string; // uuid
  /**
   * Unique identifier of the host this event relates to.
   */
  hostId?: string; // uuid
  /**
   * Unique identifier of the infra-env this event relates to.
   */
  infraEnvId?: string; // uuid
  severity: 'info' | 'warning' | 'error' | 'critical';
  category?: 'user' | 'metrics';
  message: string;
  eventTime: string; // date-time
  /**
   * Unique identifier of the request that caused this event to occur.
   */
  requestId?: string; // uuid
  /**
   * Additional properties for the event in JSON format.
   */
  props?: string;
}
export type EventList = Event[];
export interface FeatureSupportLevel {
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion?: string;
  features?: {
    /**
     * The ID of the feature
     */
    featureId?:
      | 'ADDITIONAL_NTP_SOURCE'
      | 'REQUESTED_HOSTNAME'
      | 'PROXY'
      | 'SNO'
      | 'DAY2_HOSTS'
      | 'VIP_AUTO_ALLOC'
      | 'DISK_SELECTION'
      | 'OVN_NETWORK_TYPE'
      | 'SDN_NETWORK_TYPE'
      | 'PLATFORM_SELECTION'
      | 'SCHEDULABLE_MASTERS'
      | 'AUTO_ASSIGN_ROLE'
      | 'CUSTOM_MANIFEST'
      | 'DISK_ENCRYPTION'
      | 'CLUSTER_MANAGED_NETWORKING_WITH_VMS'
      | 'ARM64_ARCHITECTURE';
    supportLevel?: 'supported' | 'unsupported' | 'tech-preview' | 'dev-preview';
  }[];
}
export type FeatureSupportLevels = FeatureSupportLevel[];
export type FreeAddressesList = string /* ipv4 */[];
export type FreeAddressesRequest = string /* ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$ */[];
export interface FreeNetworkAddresses {
  network?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  freeAddresses?: string /* ipv4 */[];
}
export type FreeNetworksAddresses = FreeNetworkAddresses[];
export interface Gpu {
  /**
   * The name of the device vendor (for example "Intel Corporation")
   */
  vendor?: string;
  /**
   * ID of the vendor (for example "8086")
   */
  vendorId?: string;
  /**
   * ID of the device (for example "3ea0")
   */
  deviceId?: string;
  /**
   * Product name of the device (for example "UHD Graphics 620 (Whiskey Lake)")
   */
  name?: string;
  /**
   * Device address (for example "0000:00:02.0")
   */
  address?: string;
}
export interface Host {
  /**
   * Indicates the type of this object. Will be 'Host' if this is a complete object or 'HostLink' if it is just a link, or
   * 'AddToExistingClusterHost' for host being added to existing OCP cluster, or
   *
   */
  kind: 'Host' | 'AddToExistingClusterHost';
  /**
   * Unique identifier of the object.
   */
  id: string; // uuid
  /**
   * Self link.
   */
  href: string;
  /**
   * The cluster that this host is associated with.
   */
  clusterId?: string; // uuid
  /**
   * The infra-env that this host is associated with.
   */
  infraEnvId?: string; // uuid
  status:
    | 'discovering'
    | 'known'
    | 'disconnected'
    | 'insufficient'
    | 'disabled'
    | 'preparing-for-installation'
    | 'preparing-failed'
    | 'preparing-successful'
    | 'pending-for-input'
    | 'installing'
    | 'installing-in-progress'
    | 'installing-pending-user-action'
    | 'resetting-pending-user-action'
    | 'installed'
    | 'error'
    | 'resetting'
    | 'added-to-existing-cluster'
    | 'cancelled'
    | 'binding'
    | 'unbinding'
    | 'unbinding-pending-user-action'
    | 'known-unbound'
    | 'disconnected-unbound'
    | 'insufficient-unbound'
    | 'disabled-unbound'
    | 'discovering-unbound';
  statusInfo: string;
  /**
   * JSON-formatted string containing the validation results for each validation id grouped by category (network, hardware, etc.)
   */
  validationsInfo?: string;
  /**
   * The progress of log collection or empty if logs are not applicable
   */
  logsInfo?: LogsState;
  /**
   * The last time that the host status was updated.
   */
  statusUpdatedAt?: string; // date-time
  progress?: HostProgressInfo;
  /**
   * Time at which the current progress stage started.
   */
  stageStartedAt?: string; // date-time
  /**
   * Time at which the current progress stage was last updated.
   */
  stageUpdatedAt?: string; // date-time
  progressStages?: HostStage[];
  connectivity?: string;
  apiVipConnectivity?: string;
  inventory?: string;
  freeAddresses?: string;
  /**
   * The configured NTP sources on the host.
   */
  ntpSources?: string;
  /**
   * Additional information about disks, formatted as JSON.
   */
  disksInfo?: string;
  role?: HostRole;
  suggestedRole?: HostRole;
  bootstrap?: boolean;
  logsCollectedAt?: string; // datetime
  logsStartedAt?: string; // datetime
  /**
   * Installer version.
   */
  installerVersion?: string;
  /**
   * Contains the inventory disk path, This field is replaced by installationDiskId field and used for backward compatability with the old UI.
   * example:
   * /dev/sda
   */
  installationDiskPath?: string;
  /**
   * Contains the inventory disk id to install on.
   */
  installationDiskId?: string;
  updatedAt?: string; // date-time
  createdAt?: string; // date-time
  /**
   * The last time the host's agent communicated with the service.
   */
  checkedInAt?: string; // date-time
  discoveryAgentVersion?: string;
  requestedHostname?: string;
  userName?: string;
  /**
   * swagger:ignore
   */
  deletedAt?: unknown;
  /**
   * Json formatted string containing the user overrides for the host's pointer ignition
   * example:
   * {"ignition": {"version": "3.1.0"}, "storage": {"files": [{"path": "/tmp/example", "contents": {"source": "data:text/plain;base64,aGVscGltdHJhcHBlZGluYXN3YWdnZXJzcGVj"}}]}}
   */
  ignitionConfigOverrides?: string;
  installerArgs?: string;
  machineConfigPoolName?: string;
  /**
   * Array of image statuses.
   */
  imagesStatus?: string;
  /**
   * The domain name resolution result.
   */
  domainNameResolutions?: string;
  /**
   * True if the token to fetch the ignition from ignitionEndpointUrl is set.
   */
  ignitionEndpointTokenSet?: boolean;
}
export interface HostCreateParams {
  hostId: string; // uuid
  discoveryAgentVersion?: string;
}
export interface HostIgnitionParams {
  config?: string;
}
export type HostList = Host[];
export interface HostNetwork {
  cidr?: string;
  hostIds?: string /* uuid */[];
}
export interface HostProgress {
  currentStage?: HostStage;
  progressInfo?: string;
}
export interface HostProgressInfo {
  installationPercentage?: number;
  currentStage?: HostStage;
  progressInfo?: string;
  /**
   * Time at which the current progress stage started.
   */
  stageStartedAt?: string; // date-time
  /**
   * Time at which the current progress stage was last updated.
   */
  stageUpdatedAt?: string; // date-time
}
export interface HostRegistrationResponse {
  /**
   * Indicates the type of this object. Will be 'Host' if this is a complete object or 'HostLink' if it is just a link, or
   * 'AddToExistingClusterHost' for host being added to existing OCP cluster, or
   *
   */
  kind: 'Host' | 'AddToExistingClusterHost';
  /**
   * Unique identifier of the object.
   */
  id: string; // uuid
  /**
   * Self link.
   */
  href: string;
  /**
   * The cluster that this host is associated with.
   */
  clusterId?: string; // uuid
  /**
   * The infra-env that this host is associated with.
   */
  infraEnvId?: string; // uuid
  status:
    | 'discovering'
    | 'known'
    | 'disconnected'
    | 'insufficient'
    | 'disabled'
    | 'preparing-for-installation'
    | 'preparing-failed'
    | 'preparing-successful'
    | 'pending-for-input'
    | 'installing'
    | 'installing-in-progress'
    | 'installing-pending-user-action'
    | 'resetting-pending-user-action'
    | 'installed'
    | 'error'
    | 'resetting'
    | 'added-to-existing-cluster'
    | 'cancelled'
    | 'binding'
    | 'unbinding'
    | 'unbinding-pending-user-action'
    | 'known-unbound'
    | 'disconnected-unbound'
    | 'insufficient-unbound'
    | 'disabled-unbound'
    | 'discovering-unbound';
  statusInfo: string;
  /**
   * JSON-formatted string containing the validation results for each validation id grouped by category (network, hardware, etc.)
   */
  validationsInfo?: string;
  /**
   * The progress of log collection or empty if logs are not applicable
   */
  logsInfo?: LogsState;
  /**
   * The last time that the host status was updated.
   */
  statusUpdatedAt?: string; // date-time
  progress?: HostProgressInfo;
  /**
   * Time at which the current progress stage started.
   */
  stageStartedAt?: string; // date-time
  /**
   * Time at which the current progress stage was last updated.
   */
  stageUpdatedAt?: string; // date-time
  progressStages?: HostStage[];
  connectivity?: string;
  apiVipConnectivity?: string;
  inventory?: string;
  freeAddresses?: string;
  /**
   * The configured NTP sources on the host.
   */
  ntpSources?: string;
  /**
   * Additional information about disks, formatted as JSON.
   */
  disksInfo?: string;
  role?: HostRole;
  suggestedRole?: HostRole;
  bootstrap?: boolean;
  logsCollectedAt?: string; // datetime
  logsStartedAt?: string; // datetime
  /**
   * Installer version.
   */
  installerVersion?: string;
  /**
   * Contains the inventory disk path, This field is replaced by installationDiskId field and used for backward compatability with the old UI.
   * example:
   * /dev/sda
   */
  installationDiskPath?: string;
  /**
   * Contains the inventory disk id to install on.
   */
  installationDiskId?: string;
  updatedAt?: string; // date-time
  createdAt?: string; // date-time
  /**
   * The last time the host's agent communicated with the service.
   */
  checkedInAt?: string; // date-time
  discoveryAgentVersion?: string;
  requestedHostname?: string;
  userName?: string;
  /**
   * swagger:ignore
   */
  deletedAt?: unknown;
  /**
   * Json formatted string containing the user overrides for the host's pointer ignition
   * example:
   * {"ignition": {"version": "3.1.0"}, "storage": {"files": [{"path": "/tmp/example", "contents": {"source": "data:text/plain;base64,aGVscGltdHJhcHBlZGluYXN3YWdnZXJzcGVj"}}]}}
   */
  ignitionConfigOverrides?: string;
  installerArgs?: string;
  machineConfigPoolName?: string;
  /**
   * Array of image statuses.
   */
  imagesStatus?: string;
  /**
   * The domain name resolution result.
   */
  domainNameResolutions?: string;
  /**
   * True if the token to fetch the ignition from ignitionEndpointUrl is set.
   */
  ignitionEndpointTokenSet?: boolean;
  /**
   * Command for starting the next step runner
   */
  nextStepRunnerCommand?: {
    command?: string;
    args?: string[];
    /**
     * How long in seconds to wait before retrying registration if the command fails
     */
    retrySeconds?: number;
  };
}
export type HostRole = 'auto-assign' | 'master' | 'worker' | 'bootstrap';
export type HostRoleUpdateParams = 'auto-assign' | 'master' | 'worker';
export type HostStage =
  | 'Starting installation'
  | 'Waiting for control plane'
  | 'Waiting for bootkube'
  | 'Waiting for controller'
  | 'Installing'
  | 'Writing image to disk'
  | 'Rebooting'
  | 'Waiting for ignition'
  | 'Configuring'
  | 'Joined'
  | 'Done'
  | 'Failed';
export interface HostStaticNetworkConfig {
  /**
   * yaml string that can be processed by nmstate
   */
  networkYaml?: string;
  /**
   * mapping of host macs to logical interfaces used in the network yaml
   */
  macInterfaceMap?: MacInterfaceMap;
}
export interface HostTypeHardwareRequirements {
  /**
   * Host requirements that can be quantified
   */
  quantitative?: ClusterHostRequirementsDetails;
  /**
   * Host requirements that cannot be quantified at the time of calculation. Descriptions or formulas of requiements
   */
  qualitative?: string[];
}
export interface HostTypeHardwareRequirementsWrapper {
  /**
   * Requirements towards a worker node
   */
  worker?: HostTypeHardwareRequirements;
  /**
   * Requirements towards a master node
   */
  master?: HostTypeHardwareRequirements;
}
export interface HostUpdateParams {
  hostRole?: 'auto-assign' | 'master' | 'worker';
  hostName?: string;
  disksSelectedConfig?: DiskConfigParams[];
  machineConfigPoolName?: string;
  /**
   * A string which will be used as Authorization Bearer token to fetch the ignition from ignitionEndpointUrl.
   */
  ignitionEndpointToken?: string;
}
export type HostValidationId =
  | 'connected'
  | 'has-inventory'
  | 'has-min-cpu-cores'
  | 'has-min-valid-disks'
  | 'has-min-memory'
  | 'machine-cidr-defined'
  | 'has-cpu-cores-for-role'
  | 'has-memory-for-role'
  | 'hostname-unique'
  | 'hostname-valid'
  | 'belongs-to-machine-cidr'
  | 'ignition-downloadable'
  | 'belongs-to-majority-group'
  | 'valid-platform-network-settings'
  | 'ntp-synced'
  | 'container-images-available'
  | 'lso-requirements-satisfied'
  | 'ocs-requirements-satisfied'
  | 'sufficient-installation-disk-speed'
  | 'cnv-requirements-satisfied'
  | 'sufficient-network-latency-requirement-for-role'
  | 'sufficient-packet-loss-requirement-for-role'
  | 'has-default-route'
  | 'api-domain-name-resolved-correctly'
  | 'api-int-domain-name-resolved-correctly'
  | 'apps-domain-name-resolved-correctly'
  | 'compatible-with-cluster-platform'
  | 'dns-wildcard-not-configured'
  | 'disk-encryption-requirements-satisfied'
  | 'api-vip-connected';
/**
 * Explicit ignition endpoint overrides the default ignition endpoint.
 */
export interface IgnitionEndpoint {
  /**
   * The URL for the ignition endpoint.
   */
  url?: string;
  /**
   * base64 encoded CA certficate to be used when contacting the URL via https.
   */
  caCertificate?: string;
}
export interface ImageCreateParams {
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
  staticNetworkConfig?: HostStaticNetworkConfig[];
  /**
   * Type of image that should be generated.
   */
  imageType?: ImageType;
}
export interface ImageInfo {
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
  sizeBytes?: number;
  downloadUrl?: string;
  /**
   * Image generator version.
   */
  generatorVersion?: string;
  createdAt?: string; // date-time
  expiresAt?: string; // date-time
  /**
   * static network configuration string in the format expected by discovery ignition generation
   */
  staticNetworkConfig?: string;
  type?: ImageType;
}
export type ImageType = 'full-iso' | 'minimal-iso';
export interface ImportClusterParams {
  /**
   * OpenShift cluster name.
   */
  name: string;
  /**
   * The domain name used to reach the OpenShift cluster API.
   */
  apiVipDnsname: string;
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: string;
  /**
   * The id of the OCP cluster, that hosts will be added to
   */
  openshiftClusterId: string; // uuid
}
export interface InfraEnv {
  /**
   * Indicates the type of this object.
   */
  kind: 'InfraEnv';
  /**
   * Unique identifier of the object.
   */
  id: string; // uuid
  /**
   * Self link.
   */
  href: string;
  /**
   * Version of the OpenShift cluster (used to infer the RHCOS version - temporary until generic logic implemented).
   */
  openshiftVersion?: string;
  /**
   * Name of the infra-env.
   */
  name: string;
  userName?: string;
  orgId?: string;
  emailDomain?: string;
  proxy?: Proxy;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSources?: string;
  /**
   * SSH public key for debugging the installation.
   */
  sshAuthorizedKey?: string;
  /**
   * True if the pull secret has been added to the cluster.
   */
  pullSecretSet?: boolean;
  /**
   * static network configuration string in the format expected by discovery ignition generation.
   */
  staticNetworkConfig?: string;
  type: ImageType;
  /**
   * Json formatted string containing the user overrides for the initial ignition config.
   */
  ignitionConfigOverride?: string;
  /**
   * If set, all hosts that register will be associated with the specified cluster.
   */
  clusterId?: string; // uuid
  sizeBytes?: number;
  downloadUrl?: string;
  /**
   * Image generator version.
   */
  generatorVersion?: string;
  /**
   * The last time that this infra-env was updated.
   */
  updatedAt: string; // date-time
  createdAt: string; // date-time
  expiresAt?: string; // date-time
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture?: string;
}
export interface InfraEnvCreateParams {
  /**
   * Name of the infra-env.
   */
  name: string;
  proxy?: Proxy;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSources?: string;
  /**
   * SSH public key for debugging the installation.
   */
  sshAuthorizedKey?: string;
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret: string;
  staticNetworkConfig?: HostStaticNetworkConfig[];
  imageType?: ImageType;
  /**
   * JSON formatted string containing the user overrides for the initial ignition config.
   */
  ignitionConfigOverride?: string;
  /**
   * If set, all hosts that register will be associated with the specified cluster.
   */
  clusterId?: string; // uuid
  /**
   * Version of the OpenShift cluster (used to infer the RHCOS version - temporary until generic logic implemented).
   */
  openshiftVersion: string;
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture?: string;
}
export interface InfraEnvImageUrl {
  /**
   * Pre-signed URL for downloading the infra-env discovery image.
   */
  url?: string;
  /**
   * Expiration time for the URL token.
   */
  expiresAt?: string; // date-time
}
export type InfraEnvList = InfraEnv[];
export interface InfraEnvUpdateParams {
  proxy?: Proxy;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSources?: string;
  /**
   * SSH public key for debugging the installation.
   */
  sshAuthorizedKey?: string;
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret?: string;
  staticNetworkConfig?: HostStaticNetworkConfig[];
  imageType?: ImageType;
  /**
   * JSON formatted string containing the user overrides for the initial ignition config.
   */
  ignitionConfigOverride?: string;
}
export interface InfraError {
  /**
   * Numeric identifier of the error.
   */
  code: number; // int32
  /**
   * Human-readable description of the error.
   */
  message: string;
}
export type IngressCertParams = string;
export interface InstallerArgsParams {
  /**
   * List of additional arguments passed to coreos-installer
   * example:
   * --append-karg,ip=192.0.2.2::192.0.2.254:255.255.255.0:core0.example.com:enp1s0:none,--save-partindex,1,-n
   */
  args?: string[];
}
export interface Interface {
  ipv6Addresses?: string[];
  vendor?: string;
  name?: string;
  hasCarrier?: boolean;
  product?: string;
  mtu?: number;
  ipv4Addresses?: string[];
  biosdevname?: string;
  clientId?: string;
  macAddress?: string;
  flags?: string[];
  speedMbps?: number;
}
export interface Inventory {
  hostname?: string;
  bmcAddress?: string;
  interfaces?: Interface[];
  disks?: Disk[];
  boot?: Boot;
  systemVendor?: SystemVendor;
  bmcV6address?: string;
  memory?: Memory;
  cpu?: Cpu;
  timestamp?: number;
  gpus?: Gpu[];
  routes?: Route[];
  tpmVersion?: 'none' | '1.2' | '2.0';
}
export interface IoPerf {
  /**
   * 99th percentile of fsync duration in milliseconds
   */
  syncDuration?: number;
}
export interface L2Connectivity {
  outgoingNic?: string;
  outgoingIpAddress?: string;
  remoteIpAddress?: string;
  remoteMac?: string;
  successful?: boolean;
}
export interface L3Connectivity {
  outgoingNic?: string;
  remoteIpAddress?: string;
  successful?: boolean;
  /**
   * Average round trip time in milliseconds.
   */
  averageRttMs?: number; // double
  /**
   * Percentage of packets lost during connectivity check.
   */
  packetLossPercentage?: number; // double
}
export type ListManagedDomains = ManagedDomain[];
export type ListManifests = Manifest[];
export interface ListVersions {
  versions?: Versions;
  releaseTag?: string;
}
export interface LogsProgressParams {
  /**
   * The state of collecting logs.
   */
  logsState: LogsState;
}
export type LogsState = 'requested' | 'collecting' | 'completed' | 'timeout' | '';
export type LogsType = 'host' | 'controller' | 'all' | '';
export type MacInterfaceMap = {
  /**
   * mac address present on the host
   */
  macAddress?: string; // ^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$
  /**
   * nic name used in the yaml, which relates 1:1 to the mac address
   */
  logicalNicName?: string;
}[];
/**
 * IP address block for node IP blocks.
 */
export interface MachineNetwork {
  /**
   * The cluster that this network is associated with.
   */
  clusterId?: string; // uuid
  /**
   * The IP block address pool for machines within the cluster.
   */
  cidr?: Subnet; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
}
export interface ManagedDomain {
  domain?: string;
  provider?: 'route53';
}
export interface Manifest {
  /**
   * The folder that contains the files. Manifests can be placed in 'manifests' or 'openshift' directories.
   */
  folder?: 'manifests' | 'openshift';
  /**
   * The file name prefaced by the folder that contains it.
   */
  fileName?: string;
}
export interface Memory {
  physicalBytes?: number;
  usableBytes?: number;
  /**
   * The method by which the physical memory was set
   */
  physicalBytesMethod?: MemoryMethod;
}
export type MemoryMethod = 'dmidecode' | 'ghw' | 'meminfo';
export interface MonitoredOperator {
  /**
   * The cluster that this operator is associated with.
   */
  clusterId?: string; // uuid
  /**
   * Unique name of the operator.
   */
  name?: string;
  /**
   * Namespace where to deploy an operator. Only some operators require a namespace.
   */
  namespace?: string;
  /**
   * The name of the subscription of the operator.
   */
  subscriptionName?: string;
  operatorType?: OperatorType;
  /**
   * Blob of operator-dependent parameters that are required for installation.
   */
  properties?: string;
  /**
   * Positive number represents a timeout in seconds for the operator to be available.
   */
  timeoutSeconds?: number;
  status?: OperatorStatus;
  /**
   * Detailed information about the operator state.
   */
  statusInfo?: string;
  /**
   * Time at which the operator was last updated.
   */
  statusUpdatedAt?: string; // date-time
}
export type MonitoredOperatorsList = MonitoredOperator[];
export interface NtpSource {
  /**
   * NTP source name or IP.
   */
  sourceName?: string;
  /**
   * Indication of state of an NTP source.
   */
  sourceState?: SourceState;
}
export interface NtpSynchronizationRequest {
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  ntpSource: string;
}
export interface NtpSynchronizationResponse {
  ntpSources?: NtpSource[];
}
export interface OpenshiftVersion {
  /**
   * Name of the version to be presented to the user.
   */
  displayName?: string;
  /**
   * The installation image of the OpenShift cluster.
   */
  releaseImage?: string;
  /**
   * OCP version from the release metadata.
   */
  releaseVersion?: string;
  /**
   * The base RHCOS image used for the discovery iso.
   */
  rhcosImage?: string;
  /**
   * The RHCOS rootfs url.
   */
  rhcosRootfs?: string;
  /**
   * Build ID of the RHCOS image.
   */
  rhcosVersion?: string;
  /**
   * Level of support of the version.
   */
  supportLevel?: 'beta' | 'production' | 'maintenance';
  /**
   * Indication that the version is the recommended one.
   */
  default?: boolean;
  /**
   * Available CPU architectures.
   */
  cpuArchitectures?: string[];
}
export interface OpenshiftVersions {
  [name: string]: OpenshiftVersion;
}
export interface OperatorCreateParams {
  name?: string;
  /**
   * Blob of operator-dependent parameters that are required for installation.
   */
  properties?: string;
}
export interface OperatorHardwareRequirements {
  /**
   * Unique name of the operator. Corresponds to name property of the monitored-operator, i.e. "lso", "cnv", etc.
   */
  operatorName?: string;
  /**
   * List of other operator unique names that are required to be installed. Corresponds to name property of the monitored-operator, i.e. "lso", "cnv", etc.
   */
  dependencies?: string[];
  requirements?: HostTypeHardwareRequirementsWrapper;
}
export interface OperatorHostRequirements {
  /**
   * Name of the operator
   */
  operatorName?: string;
  /**
   * Host requirements for the operator
   */
  requirements?: ClusterHostRequirementsDetails;
}
export interface OperatorMonitorReport {
  /**
   * Unique name of the operator.
   */
  name?: string;
  status?: OperatorStatus;
  /**
   * Detailed information about the operator state.
   */
  statusInfo?: string;
}
export type OperatorProperties = OperatorProperty[];
export interface OperatorProperty {
  /**
   * Name of the property
   */
  name?: string;
  /**
   * Type of the property
   */
  dataType?: 'boolean' | 'string' | 'integer' | 'float';
  /**
   * Indicates whether the property is reqired
   */
  mandatory?: boolean;
  /**
   * Values to select from
   */
  options?: string[];
  /**
   * Description of a property
   */
  description?: string;
  /**
   * Default value for the property
   */
  defaultValue?: string;
}
/**
 * Represents the operator state.
 */
export type OperatorStatus = 'failed' | 'progressing' | 'available';
/**
 * Kind of operator. Different types are monitored by the service differently.
 */
export type OperatorType = 'builtin' | 'olm';
export interface OsImage {
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: string;
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture: string;
  /**
   * The base OS image used for the discovery iso.
   */
  url: string;
  /**
   * The OS rootfs url.
   */
  rootfsUrl: string;
  /**
   * Build ID of the OS image.
   */
  version: string;
}
export type OsImages = OsImage[];
/**
 * oVirt platform-specific configuration upon which to perform the installation.
 */
export interface OvirtPlatform {
  /**
   * The oVirt's engine fully qualified domain name.
   */
  fqdn?: string;
  /**
   * The user name to use to connect to the oVirt instance.
   */
  username?: string;
  /**
   * The password for the oVirt user name.
   */
  password?: string; // password
  /**
   * Verify oVirt engine certificate.
   */
  insecure?: boolean;
  /**
   * The CA Bundle of the oVirt's engine certificate.
   */
  caBundle?: string;
  /**
   * The oVirt cluster ID.
   */
  clusterId?: string; // uuid
  /**
   * The oVirt storage domain ID.
   */
  storageDomainId?: string; // uuid
  /**
   * The oVirt network the VMs will be attached to.
   */
  networkName?: string;
  /**
   * The oVirt VNIC profile ID.
   */
  vnicProfileId?: string; // uuid
}
/**
 * The configuration for the specific platform upon which to perform the installation.
 */
export interface Platform {
  type: PlatformType;
  vsphere?: VspherePlatform;
  ovirt?: OvirtPlatform;
}
export type PlatformType = 'baremetal' | 'vsphere' | 'ovirt' | 'none';
export interface PreflightHardwareRequirements {
  /**
   * Preflight operators hardware requirements
   */
  operators?: OperatorHardwareRequirements[];
  /**
   * Preflight OCP requirements
   */
  ocp?: HostTypeHardwareRequirementsWrapper;
}
export interface Presigned {
  url: string;
}
export interface Proxy {
  /**
   * A proxy URL to use for creating HTTP connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpProxy?: string;
  /**
   * A proxy URL to use for creating HTTPS connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpsProxy?: string;
  /**
   * An "*" or a comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude from proxying.
   */
  noProxy?: string;
}
export interface ReleaseImage {
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: string;
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   */
  cpuArchitecture: string;
  /**
   * The installation image of the OpenShift cluster.
   */
  url: string;
  /**
   * OCP version from the release metadata.
   */
  version: string;
  /**
   * Indication that the version is the recommended one.
   */
  default?: boolean;
  /**
   * Level of support of the version.
   */
  supportLevel?: 'beta' | 'production' | 'maintenance';
}
export type ReleaseImages = ReleaseImage[];
export interface Route {
  /**
   * Interface to which packets for this route will be sent
   */
  interface?: string;
  /**
   * Gateway address where the packets are sent
   */
  gateway?: string;
  /**
   * The destination network or destination host
   */
  destination?: string;
  /**
   * Defines whether this is an IPv4 (4) or IPv6 route (6)
   */
  family?: number; // int32
}
/**
 * IP address block for service IP blocks.
 */
export interface ServiceNetwork {
  /**
   * The cluster that this network is associated with.
   */
  clusterId?: string; // uuid
  /**
   * The IP block address pool.
   */
  cidr?: Subnet; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
}
export type SourceState =
  | 'synced'
  | 'combined'
  | 'notCombined'
  | 'error'
  | 'variable'
  | 'unreachable';
export interface Step {
  stepType?: StepType;
  stepId?: string;
  command?: string;
  args?: string[];
}
export interface StepReply {
  stepType?: StepType;
  stepId?: string;
  exitCode?: number;
  output?: string;
  error?: string;
}
export type StepType =
  | 'connectivity-check'
  | 'execute'
  | 'inventory'
  | 'install'
  | 'free-network-addresses'
  | 'reset-installation'
  | 'dhcp-lease-allocate'
  | 'api-vip-connectivity-check'
  | 'ntp-synchronizer'
  | 'installation-disk-speed-check'
  | 'container-image-availability'
  | 'domain-resolution';
export interface Steps {
  nextInstructionSeconds?: number;
  /**
   * What to do after finishing to run step instructions
   */
  postStepAction?: 'exit' | 'continue';
  instructions?: Step[];
}
export type StepsReply = StepReply[];
export type Subnet = string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
export interface SystemVendor {
  serialNumber?: string;
  productName?: string;
  manufacturer?: string;
  /**
   * Whether the machine appears to be a virtual machine or not
   */
  virtual?: boolean;
}
export interface Usage {
  /**
   * Unique idenftifier of the feature
   */
  id?: string;
  /**
   * name of the feature to track
   */
  name?: string;
  /**
   * additional properties of the feature
   */
  data?: {
    [name: string]: {};
  };
}
export interface V2ClusterUpdateParams {
  /**
   * OpenShift cluster name.
   */
  name?: string;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated. This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  platform?: Platform;
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The virtual IP used to reach the OpenShift cluster's API.
   */
  apiVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))?$
  /**
   * The virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3})|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,}))?$
  /**
   * The domain name used to reach the OpenShift cluster API.
   */
  apiVipDnsName?: string;
  /**
   * A CIDR that all hosts belonging to the cluster should have an interfaces with IP address that belongs to this CIDR. The apiVip belongs to this CIDR.
   */
  machineNetworkCidr?: string; // ^(?:(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:(?:[0-9])|(?:[1-2][0-9])|(?:3[0-2])))|(?:(?:[0-9a-fA-F]*:[0-9a-fA-F]*){2,})/(?:(?:[0-9])|(?:[1-9][0-9])|(?:1[0-1][0-9])|(?:12[0-8])))$
  /**
   * The pull secret obtained from Red Hat OpenShift Cluster Manager at console.redhat.com/openshift/install/pull-secret.
   */
  pullSecret?: string;
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Indicate if virtual IP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
  /**
   * A proxy URL to use for creating HTTP connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpProxy?: string;
  /**
   * A proxy URL to use for creating HTTPS connections outside the cluster.
   * http://\<username\>:\<pswd\>@\<ip\>:\<port\>
   *
   */
  httpsProxy?: string;
  /**
   * An "*" or a comma-separated list of destination domain names, domains, IP addresses, or other network CIDRs to exclude from proxying.
   */
  noProxy?: string;
  /**
   * Indicate if the networking is managed by the user.
   */
  userManagedNetworking?: boolean;
  /**
   * A comma-separated list of NTP sources (name or IP) going to be added to all the hosts.
   */
  additionalNtpSource?: string;
  /**
   * List of OLM operators to be installed.
   */
  olmOperators?: OperatorCreateParams[];
  /**
   * Enable/disable hyperthreading on master nodes, worker nodes, or all nodes.
   */
  hyperthreading?: 'masters' | 'workers' | 'all' | 'none';
  /**
   * The desired network type used.
   */
  networkType?: 'OpenShiftSDN' | 'OVNKubernetes';
  /**
   * Schedule workloads on masters
   */
  schedulableMasters?: boolean;
  /**
   * Cluster networks that are associated with this cluster.
   */
  clusterNetworks?: ClusterNetwork[];
  /**
   * Service networks that are associated with this cluster.
   */
  serviceNetworks?: ServiceNetwork[];
  /**
   * Machine networks that are associated with this cluster.
   */
  machineNetworks?: MachineNetwork[];
  /**
   * Installation disks encryption mode and host roles to be applied.
   */
  diskEncryption?: DiskEncryption;
  /**
   * Explicit ignition endpoint overrides the default ignition endpoint.
   */
  ignitionEndpoint?: IgnitionEndpoint;
}
export interface V2Events {
  clusterId?: string;
  hostId?: string;
  infraEnvId?: string;
  categories?: string[];
}
export interface V2InfraEnvs {
  clusterId?: string;
}
export interface VersionedHostRequirements {
  /**
   * Version of the component for which requirements are defined
   */
  version?: string;
  /**
   * Master node requirements
   */
  master?: ClusterHostRequirementsDetails;
  /**
   * Worker node requirements
   */
  worker?: ClusterHostRequirementsDetails;
  /**
   * Single node OpenShift node requirements
   */
  sno?: ClusterHostRequirementsDetails;
}
export interface Versions {
  [name: string]: string;
}
/**
 * Vsphere platform specific configuration upon which to perform the installation
 */
export interface VspherePlatform {
  /**
   * The user name to use to connect to the vCenter instance with. This user must have at least the roles and privileges that are required for static or dynamic persistent volume provisioning in vSphere.
   */
  username?: string;
  /**
   * The password for the vCenter user name.
   */
  password?: string; // password
  /**
   * The name of the datacenter to use in the vCenter instance.
   */
  datacenter?: string;
  /**
   * The fully-qualified hostname or IP address of the vCenter server.
   */
  vCenter?: string;
  /**
   * The vCenter cluster to install the OpenShift Container Platform cluster in.
   */
  cluster?: string;
  /**
   * The name of the default datastore to use for provisioning volumes.
   */
  defaultDatastore?: string;
  /**
   * The network in the vCenter instance that contains the virtual IP addresses and DNS records that you configured.
   */
  network?: string;
  /**
   * Optional. The absolute path of an existing folder where the installation program creates the virtual machines. If you do not provide this value, the installation program creates a folder that is named with the infrastructure ID in the datacenter virtual machine folder.
   */
  folder?: string;
}

export enum CpuArchitecture {
  x86 = 'x86_64',
  ARM = 'arm64',
}
