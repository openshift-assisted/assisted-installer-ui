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
 * Command for starting the next step runner
 * @export
 * @interface HostRegistrationResponseAllOfNextStepRunnerCommand
 */
export interface HostRegistrationResponseAllOfNextStepRunnerCommand {
  /**
   *
   * @type {Array<string>}
   * @memberof HostRegistrationResponseAllOfNextStepRunnerCommand
   */
  args?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof HostRegistrationResponseAllOfNextStepRunnerCommand
   */
  command?: string;
  /**
   * How long in seconds to wait before retrying registration if the command fails
   * @type {number}
   * @memberof HostRegistrationResponseAllOfNextStepRunnerCommand
   */
  retry_seconds?: number;
}
