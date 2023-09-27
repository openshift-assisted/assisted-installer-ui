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
import { AWSSpotMarketOptions } from './awsspot-market-options';

/**
 * Representation of aws machine pool specific parameters.
 * @export
 * @interface AWSMachinePool
 */
export interface AWSMachinePool {
    /**
     * Indicates the type of this object. Will be \'AWSMachinePool\' if this is a complete object or \'AWSMachinePoolLink\' if it is just a link.
     * @type {string}
     * @memberof AWSMachinePool
     */
    'kind'?: string;
    /**
     * Unique identifier of the object.
     * @type {string}
     * @memberof AWSMachinePool
     */
    'id'?: string;
    /**
     * Self link.
     * @type {string}
     * @memberof AWSMachinePool
     */
    'href'?: string;
    /**
     * 
     * @type {AWSSpotMarketOptions}
     * @memberof AWSMachinePool
     */
    'spot_market_options'?: AWSSpotMarketOptions;
}
