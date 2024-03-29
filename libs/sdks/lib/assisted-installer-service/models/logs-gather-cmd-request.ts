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
 * @interface LogsGatherCmdRequest
 */
export interface LogsGatherCmdRequest {
  /**
   * Host is bootstrap or not
   * @type {boolean}
   * @memberof LogsGatherCmdRequest
   */
  bootstrap: boolean;
  /**
   * Cluster id
   * @type {string}
   * @memberof LogsGatherCmdRequest
   */
  cluster_id: string;
  /**
   * Host id
   * @type {string}
   * @memberof LogsGatherCmdRequest
   */
  host_id: string;
  /**
   * Infra env id
   * @type {string}
   * @memberof LogsGatherCmdRequest
   */
  infra_env_id: string;
  /**
   * Run installer gather logs
   * @type {boolean}
   * @memberof LogsGatherCmdRequest
   */
  installer_gather: boolean;
  /**
   * List of master ips
   * @type {Array<string>}
   * @memberof LogsGatherCmdRequest
   */
  master_ips?: Array<string>;
}
