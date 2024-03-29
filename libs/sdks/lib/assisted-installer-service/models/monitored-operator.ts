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
import { OperatorStatus } from './operator-status';
// May contain unused imports in some cases
// @ts-ignore
import { OperatorType } from './operator-type';

/**
 *
 * @export
 * @interface MonitoredOperator
 */
export interface MonitoredOperator {
  /**
   * The cluster that this operator is associated with.
   * @type {string}
   * @memberof MonitoredOperator
   */
  cluster_id?: string;
  /**
   * Unique name of the operator.
   * @type {string}
   * @memberof MonitoredOperator
   */
  name?: string;
  /**
   * Namespace where to deploy an operator. Only some operators require a namespace.
   * @type {string}
   * @memberof MonitoredOperator
   */
  namespace?: string;
  /**
   *
   * @type {OperatorType}
   * @memberof MonitoredOperator
   */
  operator_type?: OperatorType;
  /**
   * Blob of operator-dependent parameters that are required for installation.
   * @type {string}
   * @memberof MonitoredOperator
   */
  properties?: string;
  /**
   *
   * @type {OperatorStatus}
   * @memberof MonitoredOperator
   */
  status?: OperatorStatus;
  /**
   * Detailed information about the operator state.
   * @type {string}
   * @memberof MonitoredOperator
   */
  status_info?: string;
  /**
   * Time at which the operator was last updated.
   * @type {string}
   * @memberof MonitoredOperator
   */
  status_updated_at?: string;
  /**
   * The name of the subscription of the operator.
   * @type {string}
   * @memberof MonitoredOperator
   */
  subscription_name?: string;
  /**
   * Positive number represents a timeout in seconds for the operator to be available.
   * @type {number}
   * @memberof MonitoredOperator
   */
  timeout_seconds?: number;
  /**
   * Operator version
   * @type {string}
   * @memberof MonitoredOperator
   */
  version?: string;
}
