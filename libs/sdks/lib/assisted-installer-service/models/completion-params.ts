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
 * @interface CompletionParams
 */
export interface CompletionParams {
  /**
   *
   * @type {boolean}
   * @memberof CompletionParams
   */
  is_success: boolean;
  /**
   * additional data from the cluster
   * @type {{ [key: string]: object; }}
   * @memberof CompletionParams
   */
  data?: { [key: string]: object };
  /**
   *
   * @type {string}
   * @memberof CompletionParams
   */
  error_info?: string;
}
