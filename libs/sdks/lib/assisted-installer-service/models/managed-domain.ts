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
 * @interface ManagedDomain
 */
export interface ManagedDomain {
  /**
   *
   * @type {string}
   * @memberof ManagedDomain
   */
  domain?: string;
  /**
   *
   * @type {string}
   * @memberof ManagedDomain
   */
  provider?: ManagedDomainProviderEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum ManagedDomainProviderEnum {
  Route53 = 'route53',
}
