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
import { ClusterHostRequirementsDetails } from './cluster-host-requirements-details';

/**
 *
 * @export
 * @interface OperatorHostRequirements
 */
export interface OperatorHostRequirements {
  /**
   * Name of the operator
   * @type {string}
   * @memberof OperatorHostRequirements
   */
  operator_name?: string;
  /**
   *
   * @type {ClusterHostRequirementsDetails}
   * @memberof OperatorHostRequirements
   */
  requirements?: ClusterHostRequirementsDetails;
}
