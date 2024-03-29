/* tslint:disable */
/* eslint-disable */
/**
 * Authorization Service API
 * Enables access control on resources of OCM services
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
 * @interface CapabilityReviewRequest
 */
export interface CapabilityReviewRequest {
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  account_username: string;
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  capability: CapabilityReviewRequestCapabilityEnum;
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  type: CapabilityReviewRequestTypeEnum;
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  cluster_id?: string;
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  organization_id?: string;
  /**
   *
   * @type {string}
   * @memberof CapabilityReviewRequest
   */
  subscription_id?: string;
}

/**
 * @export
 * @enum {string}
 */
export enum CapabilityReviewRequestCapabilityEnum {
  ManageClusterAdmin = 'manage_cluster_admin',
}
/**
 * @export
 * @enum {string}
 */
export enum CapabilityReviewRequestTypeEnum {
  Cluster = 'Cluster',
}
