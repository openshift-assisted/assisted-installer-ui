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



/**
 * 
 * @export
 * @interface ModelError
 */
export interface ModelError {
    /**
     * Indicates the type of this object. Will always be \'Error\'
     * @type {string}
     * @memberof ModelError
     */
    'kind'?: string;
    /**
     * Numeric identifier of the error.
     * @type {number}
     * @memberof ModelError
     */
    'id'?: number;
    /**
     * Self link.
     * @type {string}
     * @memberof ModelError
     */
    'href'?: string;
    /**
     * Globally unique code of the error, composed of the unique identifier of the API and the numeric identifier of the error. For example, for if the numeric identifier of the error is `93` and the identifier of the API is `clusters_mgmt` then the code will be `CLUSTERS-MGMT-93`.
     * @type {string}
     * @memberof ModelError
     */
    'code'?: string;
    /**
     * Human readable description of the error.
     * @type {string}
     * @memberof ModelError
     */
    'reason'?: string;
    /**
     * Extra information about the error.
     * @type {{ [key: string]: any; }}
     * @memberof ModelError
     */
    'details'?: { [key: string]: any; };
}
