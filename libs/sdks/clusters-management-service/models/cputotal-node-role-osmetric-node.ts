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
 * Representation of information from telemetry about a the CPU capacity by node role and OS.
 * @export
 * @interface CPUTotalNodeRoleOSMetricNode
 */
export interface CPUTotalNodeRoleOSMetricNode {
    /**
     * The total CPU capacity of nodes with this set of roles and operating system.
     * @type {number}
     * @memberof CPUTotalNodeRoleOSMetricNode
     */
    'cpu_total'?: number;
    /**
     * Representation of the node role for a cluster.
     * @type {Array<string>}
     * @memberof CPUTotalNodeRoleOSMetricNode
     */
    'node_roles'?: Array<string>;
    /**
     * The operating system.
     * @type {string}
     * @memberof CPUTotalNodeRoleOSMetricNode
     */
    'operating_system'?: string;
    /**
     * 
     * @type {string}
     * @memberof CPUTotalNodeRoleOSMetricNode
     */
    'time'?: string;
}
