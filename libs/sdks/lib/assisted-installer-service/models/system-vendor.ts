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
 * @interface SystemVendor
 */
export interface SystemVendor {
  /**
   *
   * @type {string}
   * @memberof SystemVendor
   */
  manufacturer?: string;
  /**
   *
   * @type {string}
   * @memberof SystemVendor
   */
  product_name?: string;
  /**
   *
   * @type {string}
   * @memberof SystemVendor
   */
  serial_number?: string;
  /**
   * Whether the machine appears to be a virtual machine or not
   * @type {boolean}
   * @memberof SystemVendor
   */
  virtual?: boolean;
}
