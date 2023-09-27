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
import { AWSInfrastructureAccessRoleState } from './awsinfrastructure-access-role-state';

/**
 * A set of acces permissions for AWS resources
 * @export
 * @interface AWSInfrastructureAccessRole
 */
export interface AWSInfrastructureAccessRole {
    /**
     * Indicates the type of this object. Will be \'AWSInfrastructureAccessRole\' if this is a complete object or \'AWSInfrastructureAccessRoleLink\' if it is just a link.
     * @type {string}
     * @memberof AWSInfrastructureAccessRole
     */
    'kind'?: string;
    /**
     * Unique identifier of the object.
     * @type {string}
     * @memberof AWSInfrastructureAccessRole
     */
    'id'?: string;
    /**
     * Self link.
     * @type {string}
     * @memberof AWSInfrastructureAccessRole
     */
    'href'?: string;
    /**
     * Description of the role.
     * @type {string}
     * @memberof AWSInfrastructureAccessRole
     */
    'description'?: string;
    /**
     * Human friendly identifier of the role, for example `Read only`.
     * @type {string}
     * @memberof AWSInfrastructureAccessRole
     */
    'display_name'?: string;
    /**
     * 
     * @type {AWSInfrastructureAccessRoleState}
     * @memberof AWSInfrastructureAccessRole
     */
    'state'?: AWSInfrastructureAccessRoleState;
}


