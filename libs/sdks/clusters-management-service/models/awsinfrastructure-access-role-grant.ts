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
import { AWSInfrastructureAccessRole } from './awsinfrastructure-access-role';
// May contain unused imports in some cases
// @ts-ignore
import { AWSInfrastructureAccessRoleGrantState } from './awsinfrastructure-access-role-grant-state';

/**
 * Representation of an AWS infrastructure access role grant.
 * @export
 * @interface AWSInfrastructureAccessRoleGrant
 */
export interface AWSInfrastructureAccessRoleGrant {
    /**
     * Indicates the type of this object. Will be \'AWSInfrastructureAccessRoleGrant\' if this is a complete object or \'AWSInfrastructureAccessRoleGrantLink\' if it is just a link.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'kind'?: string;
    /**
     * Unique identifier of the object.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'id'?: string;
    /**
     * Self link.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'href'?: string;
    /**
     * URL to switch to the role in AWS console.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'console_url'?: string;
    /**
     * 
     * @type {AWSInfrastructureAccessRole}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'role'?: AWSInfrastructureAccessRole;
    /**
     * 
     * @type {AWSInfrastructureAccessRoleGrantState}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'state'?: AWSInfrastructureAccessRoleGrantState;
    /**
     * Description of the state. Will be empty unless state is \'Failed\'.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'state_description'?: string;
    /**
     * The user AWS IAM ARN we want to grant the role.
     * @type {string}
     * @memberof AWSInfrastructureAccessRoleGrant
     */
    'user_arn'?: string;
}


