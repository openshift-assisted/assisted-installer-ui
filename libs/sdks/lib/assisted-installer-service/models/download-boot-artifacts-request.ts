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
 * Information sent to the agent for downloading artifacts to boot a host into discovery.
 * @export
 * @interface DownloadBootArtifactsRequest
 */
export interface DownloadBootArtifactsRequest {
  /**
   * The base directory on the host that contains the /boot folder. The host will download boot artifacts into a folder in this directory.
   * @type {string}
   * @memberof DownloadBootArtifactsRequest
   */
  host_fs_mount_dir: string;
  /**
   * URL address to download the initrd.
   * @type {string}
   * @memberof DownloadBootArtifactsRequest
   */
  initrd_url: string;
  /**
   * URL address to download the kernel.
   * @type {string}
   * @memberof DownloadBootArtifactsRequest
   */
  kernel_url: string;
  /**
   * URL address to download the rootfs.
   * @type {string}
   * @memberof DownloadBootArtifactsRequest
   */
  rootfs_url: string;
}