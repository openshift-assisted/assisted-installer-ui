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
 * Description of a cloud provider encryption key.
 * @export
 * @interface EncryptionKey
 */
export interface EncryptionKey {
    /**
     * Indicates the type of this object. Will be \'EncryptionKey\' if this is a complete object or \'EncryptionKeyLink\' if it is just a link.
     * @type {string}
     * @memberof EncryptionKey
     */
    'kind'?: string;
    /**
     * Unique identifier of the object.
     * @type {string}
     * @memberof EncryptionKey
     */
    'id'?: string;
    /**
     * Self link.
     * @type {string}
     * @memberof EncryptionKey
     */
    'href'?: string;
    /**
     * Name of the encryption key.
     * @type {string}
     * @memberof EncryptionKey
     */
    'name'?: string;
}
