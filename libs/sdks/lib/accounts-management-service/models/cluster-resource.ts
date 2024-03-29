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

// May contain unused imports in some cases
// @ts-ignore
import { ClusterResourceTotal } from './cluster-resource-total';

/**
 *
 * @export
 * @interface ClusterResource
 */
export interface ClusterResource {
  /**
   *
   * @type {ClusterResourceTotal}
   * @memberof ClusterResource
   */
  total: ClusterResourceTotal;
  /**
   *
   * @type {string}
   * @memberof ClusterResource
   */
  updated_timestamp: string;
  /**
   *
   * @type {ClusterResourceTotal}
   * @memberof ClusterResource
   */
  used: ClusterResourceTotal;
}
