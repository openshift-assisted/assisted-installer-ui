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
import { StepType } from './step-type';

/**
 *
 * @export
 * @interface StepReply
 */
export interface StepReply {
  /**
   *
   * @type {string}
   * @memberof StepReply
   */
  error?: string;
  /**
   *
   * @type {number}
   * @memberof StepReply
   */
  exit_code?: number;
  /**
   *
   * @type {string}
   * @memberof StepReply
   */
  output?: string;
  /**
   *
   * @type {string}
   * @memberof StepReply
   */
  step_id?: string;
  /**
   *
   * @type {StepType}
   * @memberof StepReply
   */
  step_type?: StepType;
}
