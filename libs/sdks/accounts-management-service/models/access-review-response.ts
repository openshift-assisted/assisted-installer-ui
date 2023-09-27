/* tslint:disable */
/* eslint-disable */
/**
 * Account Management Service API
 * Manage user subscriptions and clusters
 *
 * The version of the OpenAPI document: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * @export
 * @interface AccessReviewResponse
 */
export interface AccessReviewResponse {
  /**
   *
   * @type {boolean}
   * @memberof AccessReviewResponse
   */
  allowed: boolean;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  account_id?: string;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  action?: AccessReviewResponseActionEnum;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  cluster_id?: string;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  cluster_uuid?: string;
  /**
   *
   * @type {boolean}
   * @memberof AccessReviewResponse
   */
  is_ocm_internal?: boolean;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  organization_id?: string;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  reason?: string;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  resource_type?: AccessReviewResponseResourceTypeEnum;
  /**
   *
   * @type {string}
   * @memberof AccessReviewResponse
   */
  subscription_id?: string;
}

/**
 * @export
 * @enum {string}
 */
export enum AccessReviewResponseActionEnum {
  Get = 'get',
  List = 'list',
  Create = 'create',
  Delete = 'delete',
  Update = 'update',
}
/**
 * @export
 * @enum {string}
 */
export enum AccessReviewResponseResourceTypeEnum {
  AddOn = 'AddOn',
  Flavour = 'Flavour',
  Account = 'Account',
  AccountPool = 'AccountPool',
  Cluster = 'Cluster',
  Plan = 'Plan',
  Subscription = 'Subscription',
  Organization = 'Organization',
  Role = 'Role',
  Permission = 'Permission',
  RoleBinding = 'RoleBinding',
  Registry = 'Registry',
  RegistryCredential = 'RegistryCredential',
  CurrentAccount = 'CurrentAccount',
  AccessReview = 'AccessReview',
  SelfAcccessReview = 'SelfAcccessReview',
  ResourceReview = 'ResourceReview',
  SelfResourceReview = 'SelfResourceReview',
  ClusterRegistration = 'ClusterRegistration',
  AccessToken = 'AccessToken',
  ClusterAuthorization = 'ClusterAuthorization',
  SelfManagedCluster = 'SelfManagedCluster',
  RedhatManagedCluster = 'RedhatManagedCluster',
  ExportControlReview = 'ExportControlReview',
  ClusterLog = 'ClusterLog',
  ClusterCredential = 'ClusterCredential',
  ClusterMetric = 'ClusterMetric',
  ResourceQuota = 'ResourceQuota',
  ReservedResource = 'ReservedResource',
  Dashboard = 'Dashboard',
  ClusterProviderAndRegion = 'ClusterProviderAndRegion',
  ServiceLog = 'ServiceLog',
  InternalServiceLog = 'InternalServiceLog',
  CsLogs = 'CSLogs',
  SubscriptionLabel = 'SubscriptionLabel',
  OrganizationLabel = 'OrganizationLabel',
  SubscriptionLabelInternal = 'SubscriptionLabelInternal',
  SelfAccessReview = 'SelfAccessReview',
  SubscriptionInternal = 'SubscriptionInternal',
  SubscriptionRoleBinding = 'SubscriptionRoleBinding',
  ClusterSelfManaged = 'ClusterSelfManaged',
  ClusterSelfManagedAddon = 'ClusterSelfManagedAddon',
  ClusterSelfManagedLabel = 'ClusterSelfManagedLabel',
  ClusterSelfManagedStatus = 'ClusterSelfManagedStatus',
}
