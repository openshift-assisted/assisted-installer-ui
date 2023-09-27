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
 * @interface Event
 */
export interface Event {
  /**
   *
   * @type {string}
   * @memberof Event
   */
  event_time: string;
  /**
   *
   * @type {string}
   * @memberof Event
   */
  message: string;
  /**
   *
   * @type {string}
   * @memberof Event
   */
  severity: EventSeverityEnum;
  /**
   *
   * @type {string}
   * @memberof Event
   */
  category?: EventCategoryEnum;
  /**
   * Unique identifier of the cluster this event relates to.
   * @type {string}
   * @memberof Event
   */
  cluster_id?: string | null;
  /**
   * Unique identifier of the host this event relates to.
   * @type {string}
   * @memberof Event
   */
  host_id?: string | null;
  /**
   * Unique identifier of the infra-env this event relates to.
   * @type {string}
   * @memberof Event
   */
  infra_env_id?: string | null;
  /**
   * Event Name.
   * @type {string}
   * @memberof Event
   */
  name?: string;
  /**
   * Additional properties for the event in JSON format.
   * @type {string}
   * @memberof Event
   */
  props?: string;
  /**
   * Unique identifier of the request that caused this event to occur.
   * @type {string}
   * @memberof Event
   */
  request_id?: string;
}

/**
 * @export
 * @enum {string}
 */
export enum EventSeverityEnum {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}
/**
 * @export
 * @enum {string}
 */
export enum EventCategoryEnum {
  User = 'user',
  Metrics = 'metrics',
}
