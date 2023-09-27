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
 * Representation of an addon secret propagation
 * @export
 * @interface AddOnSecretPropagation
 */
export interface AddOnSecretPropagation {
    /**
     * ID of the secret propagation
     * @type {string}
     * @memberof AddOnSecretPropagation
     */
    'id'?: string;
    /**
     * DestinationSecret is location of the secret to be added
     * @type {string}
     * @memberof AddOnSecretPropagation
     */
    'destination_secret'?: string;
    /**
     * Indicates is this secret propagation is enabled for the addon
     * @type {boolean}
     * @memberof AddOnSecretPropagation
     */
    'enabled'?: boolean;
    /**
     * SourceSecret is location of the source secret
     * @type {string}
     * @memberof AddOnSecretPropagation
     */
    'source_secret'?: string;
}
