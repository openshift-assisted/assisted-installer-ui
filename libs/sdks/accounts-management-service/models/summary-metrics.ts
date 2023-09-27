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
import { SummaryVector } from './summary-vector';

/**
 *
 * @export
 * @interface SummaryMetrics
 */
export interface SummaryMetrics {
  /**
   *
   * @type {string}
   * @memberof SummaryMetrics
   */
  name?: string;
  /**
   *
   * @type {Array<SummaryVector>}
   * @memberof SummaryMetrics
   */
  vector?: Array<SummaryVector>;
}
