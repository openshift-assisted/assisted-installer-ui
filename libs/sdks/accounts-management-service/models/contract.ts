/* tslint:disable */
/* eslint-disable */
/**
 * Account Management Service API
 * Manage user subscriptions and clusters
 *
 * The version of the OpenAPI document: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { ContractDimension } from './contract-dimension';

/**
 *
 * @export
 * @interface Contract
 */
export interface Contract {
  /**
   *
   * @type {Array<ContractDimension>}
   * @memberof Contract
   */
  dimensions?: Array<ContractDimension>;
  /**
   *
   * @type {string}
   * @memberof Contract
   */
  end_date?: string;
  /**
   *
   * @type {string}
   * @memberof Contract
   */
  start_date?: string;
}
