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
import { L2Connectivity } from './l2-connectivity';
// May contain unused imports in some cases
// @ts-ignore
import { L3Connectivity } from './l3-connectivity';

/**
 *
 * @export
 * @interface ConnectivityRemoteHost
 */
export interface ConnectivityRemoteHost {
  /**
   *
   * @type {string}
   * @memberof ConnectivityRemoteHost
   */
  host_id?: string;
  /**
   *
   * @type {Array<L2Connectivity>}
   * @memberof ConnectivityRemoteHost
   */
  l2_connectivity?: Array<L2Connectivity>;
  /**
   *
   * @type {Array<L3Connectivity>}
   * @memberof ConnectivityRemoteHost
   */
  l3_connectivity?: Array<L3Connectivity>;
}
