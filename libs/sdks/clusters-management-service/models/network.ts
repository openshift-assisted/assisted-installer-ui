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
 * Network configuration of a cluster.
 * @export
 * @interface Network
 */
export interface Network {
    /**
     * Network host prefix which is defaulted to `23` if not specified.
     * @type {number}
     * @memberof Network
     */
    'host_prefix'?: number;
    /**
     * IP address block from which to assign machine IP addresses, for example `10.0.0.0/16`.
     * @type {string}
     * @memberof Network
     */
    'machine_cidr'?: string;
    /**
     * IP address block from which to assign pod IP addresses, for example `10.128.0.0/14`.
     * @type {string}
     * @memberof Network
     */
    'pod_cidr'?: string;
    /**
     * IP address block from which to assign service IP addresses, for example `172.30.0.0/16`.
     * @type {string}
     * @memberof Network
     */
    'service_cidr'?: string;
    /**
     * The main controller responsible for rendering the core networking components.
     * @type {string}
     * @memberof Network
     */
    'type'?: string;
}
