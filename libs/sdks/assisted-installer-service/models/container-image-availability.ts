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
import { ContainerImageAvailabilityResult } from './container-image-availability-result';

/**
 *
 * @export
 * @interface ContainerImageAvailability
 */
export interface ContainerImageAvailability {
  /**
   * The rate of size/time in seconds MBps.
   * @type {number}
   * @memberof ContainerImageAvailability
   */
  download_rate?: number;
  /**
   * A fully qualified image name (FQIN).
   * @type {string}
   * @memberof ContainerImageAvailability
   */
  name?: string;
  /**
   *
   * @type {ContainerImageAvailabilityResult}
   * @memberof ContainerImageAvailability
   */
  result?: ContainerImageAvailabilityResult;
  /**
   * Size of the image in bytes.
   * @type {number}
   * @memberof ContainerImageAvailability
   */
  size_bytes?: number;
  /**
   * Seconds it took to pull the image.
   * @type {number}
   * @memberof ContainerImageAvailability
   */
  time?: number;
}