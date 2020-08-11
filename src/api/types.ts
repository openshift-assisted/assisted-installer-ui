export interface Boot {
  currentBootMode?: string;
  pxeInterface?: string;
}
export interface Cluster {
  /**
   * Indicates the type of this object. Will be 'Cluster' if this is a complete object or 'ClusterLink' if it is just a link.
   */
  kind: 'Cluster';
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
  userId?: string;
  orgId?: string;
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion?: '4.5' | '4.6';
  imageInfo: ImageInfo;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * Virtual IP used to reach the OpenShift cluster API.
   */
  apiVip?: string; // ^(([0-9]{1,3}\.){3}[0-9]{1,3})?$
  /**
   * A CIDR that all hosts belonging to the cluster should have an interfaces with IP address that belongs to this CIDR. The apiVip belongs to this CIDR.
   */
  machineNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * Virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(([0-9]{1,3}\.){3}[0-9]{1,3})?$
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Status of the OpenShift cluster.
   */
  status:
    | 'insufficient'
    | 'ready'
    | 'error'
    | 'preparing-for-installation'
    | 'installing'
    | 'finalizing'
    | 'installed';
  /**
   * Additional information pertaining to the status of the OpenShift cluster.
   */
  statusInfo: string;
  /**
   * The last time that the cluster status has been updated
   */
  statusUpdatedAt?: string; // date-time
  /**
   * Hosts that are associated with this cluster.
   */
  hosts?: Host[];
  /**
   * The last time that this cluster was updated.
   */
  updatedAt?: string; // date-time
  /**
   * The time that this cluster was created.
   */
  createdAt?: string; // date-time
  /**
   * The time that this cluster began installation.
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
   * True if the pull-secret has been added to the cluster
   */
  pullSecretSet?: boolean;
  ignitionGeneratorVersion?: string;
  /**
   * Indicate if VIP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
}
export interface ClusterCreateParams {
  /**
   * Name of the OpenShift cluster.
   */
  name: string;
  /**
   * Version of the OpenShift cluster.
   */
  openshiftVersion: '4.5' | '4.6';
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * Virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(([0-9]{1,3}\.){3}[0-9]{1,3})?$
  /**
   * The pull secret that obtained from the Pull Secret page on the Red Hat OpenShift Cluster Manager site.
   */
  pullSecret?: string;
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Indicate if VIP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
}
export type ClusterList = Cluster[];
export interface ClusterUpdateParams {
  /**
   * OpenShift cluster name
   */
  name?: string;
  /**
   * Base domain of the cluster. All DNS records must be sub-domains of this base and include the cluster name.
   */
  baseDnsDomain?: string;
  /**
   * IP address block from which Pod IPs are allocated This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * The subnet prefix length to assign to each individual node. For example, if clusterNetworkHostPrefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.
   */
  clusterNetworkHostPrefix?: number;
  /**
   * The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.
   */
  serviceNetworkCidr?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  /**
   * Virtual IP used to reach the OpenShift cluster API.
   */
  apiVip?: string; // ^(([0-9]{1,3}\.){3}[0-9]{1,3})?$
  /**
   * Virtual IP used for cluster ingress traffic.
   */
  ingressVip?: string; // ^(([0-9]{1,3}\.){3}[0-9]{1,3})?$
  /**
   * The pull secret that obtained from the Pull Secret page on the Red Hat OpenShift Cluster Manager site.
   */
  pullSecret?: string;
  /**
   * SSH public key for debugging OpenShift nodes.
   */
  sshPublicKey?: string;
  /**
   * Indicate if VIP DHCP allocation mode is enabled.
   */
  vipDhcpAllocation?: boolean;
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
}
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
export interface Cpu {
  count?: number;
  frequency?: number;
  flags?: string[];
  modelName?: string;
  architecture?: string;
}
export interface Credentials {
  username?: string;
  password?: string;
  consoleUrl?: string;
}
export interface DebugStep {
  command: string;
}
export interface DhcpAllocationRequest {
  /**
   * The interface (NIC) to run the DHCP requests on.
   */
  interface: string;
  /**
   * MAC address for API VIP.
   */
  apiVipMac: string; // mac
  /**
   * MAC address for Ingress VIP.
   */
  ingressVipMac: string; // mac
}
export interface DhcpAllocationResponse {
  /**
   * The IPv4 address that was allocated by DHCP for API VIP.
   */
  apiVipAddress: string; // ipv4
  /**
   * The IPv4 address that was allocated by DHCP for Ingress VIP.
   */
  ingressVipAddress: string; // ipv4
}
export interface Disk {
  driveType?: string;
  vendor?: string;
  name?: string;
  path?: string;
  hctl?: string;
  byPath?: string;
  model?: string;
  wwn?: string;
  serial?: string;
  sizeBytes?: number;
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
   * Globally unique code of the error, composed of the unique identifier of the API and the numeric identifier of the error. For example, for if the numeric identifier of the error is 93 and the identifier of the API is assistedInstall then the code will be ASSISTED-INSTALL-93.
   */
  code: string;
  /**
   * Human readable description of the error.
   */
  reason: string;
}
export interface Event {
  /**
   * Unique identifier of the object this event relates to.
   */
  entityId: string; // uuid
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  eventTime: string; // date-time
  /**
   * Unique identifier for the request that caused this event to occure
   */
  requestId?: string; // uuid
}
export type EventList = Event[];
export type FreeAddressesList = string /* ipv4 */[];
export type FreeAddressesRequest = string /* ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$ */[];
export interface FreeNetworkAddresses {
  network?: string; // ^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]|[1-2][0-9]|3[0-2]?$
  freeAddresses?: string /* ipv4 */[];
}
export type FreeNetworksAddresses = FreeNetworkAddresses[];
export interface Host {
  /**
   * Indicates the type of this object. Will be 'Host' if this is a complete object or 'HostLink' if it is just a link.
   */
  kind: 'Host';
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
  status:
    | 'discovering'
    | 'known'
    | 'disconnected'
    | 'insufficient'
    | 'disabled'
    | 'preparing-for-installation'
    | 'pending-for-input'
    | 'installing'
    | 'installing-in-progress'
    | 'installing-pending-user-action'
    | 'resetting-pending-user-action'
    | 'installed'
    | 'error'
    | 'resetting';
  statusInfo: string;
  /**
   * Json formatted string containing the validations results for each validation id grouped by category (network, hardware, etc.)
   */
  validationsInfo?: string;
  /**
   * The last time that the host status has been updated
   */
  statusUpdatedAt?: string; // date-time
  progress?: HostProgressInfo;
  /**
   * Time at which the current progress stage started
   */
  stageStartedAt?: string; // date-time
  /**
   * Time at which the current progress stage was last updated
   */
  stageUpdatedAt?: string; // date-time
  progressStages?: HostStage[];
  connectivity?: string;
  inventory?: string;
  freeAddresses?: string;
  role?: HostRole;
  bootstrap?: boolean;
  /**
   * Installer version
   */
  installerVersion?: string;
  /**
   * Host installation path
   */
  installationDiskPath?: string;
  updatedAt?: string; // date-time
  createdAt?: string; // date-time
  /**
   * The last time the host's agent communicated with the service.
   */
  checkedInAt?: string; // date-time
  discoveryAgentVersion?: string;
  requestedHostname?: string;
}
export interface HostCreateParams {
  hostId: string; // uuid
  discoveryAgentVersion?: string;
}
export type HostList = Host[];
export interface HostNetwork {
  cidr?: string;
  hostIds?: string /* uuid */[];
}
export interface HostProgress {
  currentStage: HostStage;
  progressInfo?: string;
}
export interface HostProgressInfo {
  currentStage: HostStage;
  progressInfo?: string;
  /**
   * Time at which the current progress stage started
   */
  stageStartedAt?: string; // date-time
  /**
   * Time at which the current progress stage was last updated
   */
  stageUpdatedAt?: string; // date-time
}
export type HostRole = 'master' | 'worker' | 'bootstrap';
export type HostRoleUpdateParams = 'master' | 'worker';
export type HostStage =
  | 'Starting installation'
  | 'Waiting for control plane'
  | 'Start Waiting for control plane'
  | 'Installing'
  | 'Writing image to disk'
  | 'Rebooting'
  | 'Waiting for ignition'
  | 'Configuring'
  | 'Joined'
  | 'Done'
  | 'Failed';
export type HostValidationId =
  | 'connected'
  | 'has-inventory'
  | 'has-min-cpu-cores'
  | 'has-min-valid-disks'
  | 'has-min-memory'
  | 'machine-cidr-defined'
  | 'role-defined'
  | 'has-cpu-cores-for-role'
  | 'has-memory-for-role'
  | 'hostname-unique'
  | 'hostname-valid'
  | 'belongs-to-machine-cidr';
export interface ImageCreateParams {
  /**
   * The URL of the HTTP/S proxy that agents should use to access the discovery service
   * http://\<user\>:\<password\>@\<server\>:\<port\>/
   *
   */
  proxyUrl?: string;
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
}
export interface ImageInfo {
  /**
   * The URL of the HTTP/S proxy that agents should use to access the discovery service
   * http://\<user\>:\<password\>@\<server\>:\<port\>/
   *
   */
  proxyUrl?: string;
  /**
   * SSH public key for debugging the installation
   */
  sshPublicKey?: string;
  sizeBytes?: number;
  downloadUrl?: string;
  /**
   * Image generator version
   */
  generatorVersion?: string;
  createdAt?: string; // date-time
  expiresAt?: string; // date-time
}
export type IngressCertParams = string;
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
}
export type ListManagedDomains = ManagedDomain[];
export interface ListVersions {
  versions?: Versions;
  releaseTag?: string;
}
export interface ManagedDomain {
  domain?: string;
  provider?: 'route53';
}
export interface Memory {
  physicalBytes?: number;
  usableBytes?: number;
}
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
  | 'dhcp-lease-allocate';
export interface Steps {
  nextInstructionSeconds?: number;
  instructions?: Step[];
}
export type StepsReply = StepReply[];
export interface SystemVendor {
  serialNumber?: string;
  productName?: string;
  manufacturer?: string;
}
export interface Versions {
  [name: string]: string;
}
