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

/**
 *
 * @export
 * @interface SelfResourceReview
 */
export interface SelfResourceReview {
  /**
   *
   * @type {string}
   * @memberof SelfResourceReview
   */
  action: SelfResourceReviewActionEnum;
  /**
   *
   * @type {Array<string>}
   * @memberof SelfResourceReview
   */
  cluster_ids: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof SelfResourceReview
   */
  cluster_uuids: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof SelfResourceReview
   */
  organization_ids: Array<string>;
  /**
   *
   * @type {string}
   * @memberof SelfResourceReview
   */
  resource_type: SelfResourceReviewResourceTypeEnum;
  /**
   *
   * @type {Array<string>}
   * @memberof SelfResourceReview
   */
  subscription_ids: Array<string>;
}

/**
 * @export
 * @enum {string}
 */
export enum SelfResourceReviewActionEnum {
  Get = 'get',
  List = 'list',
  Create = 'create',
  Delete = 'delete',
  Update = 'update',
}
/**
 * @export
 * @enum {string}
 */
export enum SelfResourceReviewResourceTypeEnum {
  Cluster = 'Cluster',
  Subscription = 'Subscription',
}
