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
 * A network that all hosts belonging to the cluster should have an interface with IP address in. The VIPs (if exist) belong to this network.
 * @export
 * @interface MachineNetwork
 */
export interface MachineNetwork {
  /**
   *
   * @type {string}
   * @memberof MachineNetwork
   */
  cidr?: string;
  /**
   * The cluster that this network is associated with.
   * @type {string}
   * @memberof MachineNetwork
   */
  cluster_id?: string;
}
