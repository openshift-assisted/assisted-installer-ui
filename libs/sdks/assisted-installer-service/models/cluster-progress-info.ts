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
 * @interface ClusterProgressInfo
 */
export interface ClusterProgressInfo {
  /**
   *
   * @type {number}
   * @memberof ClusterProgressInfo
   */
  finalizing_stage_percentage?: number;
  /**
   *
   * @type {number}
   * @memberof ClusterProgressInfo
   */
  installing_stage_percentage?: number;
  /**
   *
   * @type {number}
   * @memberof ClusterProgressInfo
   */
  preparing_for_installation_stage_percentage?: number;
  /**
   *
   * @type {number}
   * @memberof ClusterProgressInfo
   */
  total_percentage?: number;
}
