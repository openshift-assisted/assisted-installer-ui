/* tslint:disable */
/* eslint-disable */
/**
 * AssistedInstall
 * Assisted installation
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * @export
 * @enum {string}
 */

export enum HostValidationId {
  Connected = 'connected',
  MediaConnected = 'media-connected',
  HasInventory = 'has-inventory',
  HasMinCpuCores = 'has-min-cpu-cores',
  HasMinValidDisks = 'has-min-valid-disks',
  HasMinMemory = 'has-min-memory',
  MachineCidrDefined = 'machine-cidr-defined',
  HasCpuCoresForRole = 'has-cpu-cores-for-role',
  HasMemoryForRole = 'has-memory-for-role',
  HostnameUnique = 'hostname-unique',
  HostnameValid = 'hostname-valid',
  BelongsToMachineCidr = 'belongs-to-machine-cidr',
  IgnitionDownloadable = 'ignition-downloadable',
  BelongsToMajorityGroup = 'belongs-to-majority-group',
  ValidPlatformNetworkSettings = 'valid-platform-network-settings',
  NtpSynced = 'ntp-synced',
  TimeSyncedBetweenHostAndService = 'time-synced-between-host-and-service',
  ContainerImagesAvailable = 'container-images-available',
  LsoRequirementsSatisfied = 'lso-requirements-satisfied',
  OcsRequirementsSatisfied = 'ocs-requirements-satisfied',
  OdfRequirementsSatisfied = 'odf-requirements-satisfied',
  LvmRequirementsSatisfied = 'lvm-requirements-satisfied',
  MceRequirementsSatisfied = 'mce-requirements-satisfied',
  SufficientInstallationDiskSpeed = 'sufficient-installation-disk-speed',
  CnvRequirementsSatisfied = 'cnv-requirements-satisfied',
  SufficientNetworkLatencyRequirementForRole = 'sufficient-network-latency-requirement-for-role',
  SufficientPacketLossRequirementForRole = 'sufficient-packet-loss-requirement-for-role',
  HasDefaultRoute = 'has-default-route',
  ApiDomainNameResolvedCorrectly = 'api-domain-name-resolved-correctly',
  ApiIntDomainNameResolvedCorrectly = 'api-int-domain-name-resolved-correctly',
  AppsDomainNameResolvedCorrectly = 'apps-domain-name-resolved-correctly',
  ReleaseDomainNameResolvedCorrectly = 'release-domain-name-resolved-correctly',
  CompatibleWithClusterPlatform = 'compatible-with-cluster-platform',
  DnsWildcardNotConfigured = 'dns-wildcard-not-configured',
  DiskEncryptionRequirementsSatisfied = 'disk-encryption-requirements-satisfied',
  NonOverlappingSubnets = 'non-overlapping-subnets',
  VsphereDiskUuidEnabled = 'vsphere-disk-uuid-enabled',
  CompatibleAgent = 'compatible-agent',
  NoSkipInstallationDisk = 'no-skip-installation-disk',
  NoSkipMissingDisk = 'no-skip-missing-disk',
  NoIpCollisionsInNetwork = 'no-ip-collisions-in-network',
}
