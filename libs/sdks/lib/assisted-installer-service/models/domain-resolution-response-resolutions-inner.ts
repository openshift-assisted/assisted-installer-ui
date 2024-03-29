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
 * @interface DomainResolutionResponseResolutionsInner
 */
export interface DomainResolutionResponseResolutionsInner {
  /**
   * The domain that was resolved
   * @type {string}
   * @memberof DomainResolutionResponseResolutionsInner
   */
  domain_name: string;
  /**
   * The IPv4 addresses of the domain, empty if none
   * @type {Array<string>}
   * @memberof DomainResolutionResponseResolutionsInner
   */
  ipv4_addresses?: Array<string>;
  /**
   * The IPv6 addresses of the domain, empty if none
   * @type {Array<string>}
   * @memberof DomainResolutionResponseResolutionsInner
   */
  ipv6_addresses?: Array<string>;
}
