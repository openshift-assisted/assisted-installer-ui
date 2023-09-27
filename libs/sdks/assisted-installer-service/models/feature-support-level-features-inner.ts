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

// May contain unused imports in some cases
// @ts-ignore
import { SupportLevel } from './support-level';

/**
 *
 * @export
 * @interface FeatureSupportLevelFeaturesInner
 */
export interface FeatureSupportLevelFeaturesInner {
  /**
   * (DEPRECATED) The ID of the feature
   * @type {string}
   * @memberof FeatureSupportLevelFeaturesInner
   */
  feature_id: FeatureSupportLevelFeaturesInnerFeatureIdEnum;
  /**
   *
   * @type {SupportLevel}
   * @memberof FeatureSupportLevelFeaturesInner
   */
  support_level: SupportLevel;
}

/**
 * @export
 * @enum {string}
 */
export enum FeatureSupportLevelFeaturesInnerFeatureIdEnum {
  AdditionalNtpSource = 'ADDITIONAL_NTP_SOURCE',
  RequestedHostname = 'REQUESTED_HOSTNAME',
  Proxy = 'PROXY',
  Sno = 'SNO',
  Day2Hosts = 'DAY2_HOSTS',
  VipAutoAlloc = 'VIP_AUTO_ALLOC',
  DiskSelection = 'DISK_SELECTION',
  OvnNetworkType = 'OVN_NETWORK_TYPE',
  SdnNetworkType = 'SDN_NETWORK_TYPE',
  PlatformSelection = 'PLATFORM_SELECTION',
  SchedulableMasters = 'SCHEDULABLE_MASTERS',
  AutoAssignRole = 'AUTO_ASSIGN_ROLE',
  CustomManifest = 'CUSTOM_MANIFEST',
  DiskEncryption = 'DISK_ENCRYPTION',
  ClusterManagedNetworkingWithVms = 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
  Arm64Architecture = 'ARM64_ARCHITECTURE',
  Arm64ArchitectureWithClusterManagedNetworking = 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
  Ppc64LeArchitecture = 'PPC64LE_ARCHITECTURE',
  S390XArchitecture = 'S390X_ARCHITECTURE',
  SingleNodeExpansion = 'SINGLE_NODE_EXPANSION',
  Lvm = 'LVM',
  DualStackNetworking = 'DUAL_STACK_NETWORKING',
  MultiarchReleaseImage = 'MULTIARCH_RELEASE_IMAGE',
  NutanixIntegration = 'NUTANIX_INTEGRATION',
  DualStackVips = 'DUAL_STACK_VIPS',
  UserManagedNetworkingWithMultiNode = 'USER_MANAGED_NETWORKING_WITH_MULTI_NODE',
}
