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
 * @interface MacInterfaceMapInner
 */
export interface MacInterfaceMapInner {
  /**
   * nic name used in the yaml, which relates 1:1 to the mac address
   * @type {string}
   * @memberof MacInterfaceMapInner
   */
  logical_nic_name?: string;
  /**
   * mac address present on the host
   * @type {string}
   * @memberof MacInterfaceMapInner
   */
  mac_address?: string;
}
