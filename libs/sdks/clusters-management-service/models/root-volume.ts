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
import { AWSVolume } from './awsvolume';
// May contain unused imports in some cases
// @ts-ignore
import { GCPVolume } from './gcpvolume';

/**
 * Root volume capabilities.
 * @export
 * @interface RootVolume
 */
export interface RootVolume {
    /**
     * 
     * @type {AWSVolume}
     * @memberof RootVolume
     */
    'aws'?: AWSVolume;
    /**
     * 
     * @type {GCPVolume}
     * @memberof RootVolume
     */
    'gcp'?: GCPVolume;
}
