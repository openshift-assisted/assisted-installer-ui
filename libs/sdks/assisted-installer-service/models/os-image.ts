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
 * @interface OsImage
 */
export interface OsImage {
  /**
   * The CPU architecture of the image (x86_64/arm64/etc).
   * @type {string}
   * @memberof OsImage
   */
  cpu_architecture: OsImageCpuArchitectureEnum;
  /**
   * Version of the operating system image
   * @type {string}
   * @memberof OsImage
   */
  openshift_version: string;
  /**
   * The base OS image used for the discovery iso.
   * @type {string}
   * @memberof OsImage
   */
  url: string;
  /**
   * Build ID of the OS image.
   * @type {string}
   * @memberof OsImage
   */
  version: string;
}

/**
 * @export
 * @enum {string}
 */
export enum OsImageCpuArchitectureEnum {
  X8664 = 'x86_64',
  Aarch64 = 'aarch64',
  Arm64 = 'arm64',
  Ppc64le = 'ppc64le',
  S390x = 's390x',
}
