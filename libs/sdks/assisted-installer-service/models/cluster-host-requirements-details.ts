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
 * @interface ClusterHostRequirementsDetails
 */
export interface ClusterHostRequirementsDetails {
  /**
   * Required number of CPU cores
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  cpu_cores?: number;
  /**
   * Required disk size in GB
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  disk_size_gb?: number;
  /**
   * Required installation disk speed in ms
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  installation_disk_speed_threshold_ms?: number;
  /**
   * Maximum network average latency (RTT) at L3 for role.
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  network_latency_threshold_ms?: number | null;
  /**
   * Maximum packet loss allowed at L3 for role.
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  packet_loss_percentage?: number | null;
  /**
   * Required number of RAM in MiB
   * @type {number}
   * @memberof ClusterHostRequirementsDetails
   */
  ram_mib?: number;
  /**
   * Whether TPM module should be enabled in host\'s BIOS.
   * @type {boolean}
   * @memberof ClusterHostRequirementsDetails
   */
  tpm_enabled_in_bios?: boolean;
}
