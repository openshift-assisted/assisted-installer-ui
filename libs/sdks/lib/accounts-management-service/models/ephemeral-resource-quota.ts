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
 * @interface EphemeralResourceQuota
 */
export interface EphemeralResourceQuota {
  /**
   *
   * @type {string}
   * @memberof EphemeralResourceQuota
   */
  availability_zone_type?: string;
  /**
   *
   * @type {boolean}
   * @memberof EphemeralResourceQuota
   */
  byoc?: boolean;
  /**
   *
   * @type {string}
   * @memberof EphemeralResourceQuota
   */
  resource_name?: string;
  /**
   *
   * @type {string}
   * @memberof EphemeralResourceQuota
   */
  resource_type?: string;
  /**
   *
   * @type {string}
   * @memberof EphemeralResourceQuota
   */
  sku?: string;
  /**
   *
   * @type {number}
   * @memberof EphemeralResourceQuota
   */
  sku_count?: number;
}
