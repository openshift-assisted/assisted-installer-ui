/* tslint:disable */
/* eslint-disable */
/**
 * clusters_mgmt
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * Contact: ocm-feedback@redhat.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { ClusterOperatorInfo } from './cluster-operator-info';

/**
 * Provides detailed information about the operators installed on the cluster.
 * @export
 * @interface ClusterOperatorsInfo
 */
export interface ClusterOperatorsInfo {
    /**
     * 
     * @type {Array<ClusterOperatorInfo>}
     * @memberof ClusterOperatorsInfo
     */
    'operators'?: Array<ClusterOperatorInfo>;
}
