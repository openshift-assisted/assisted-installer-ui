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
import { Syncset } from './syncset';

/**
 * 
 * @export
 * @interface ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response
 */
export interface ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response {
    /**
     * Retrieved list of syncsets.
     * @type {Array<Syncset>}
     * @memberof ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response
     */
    'items'?: Array<Syncset>;
    /**
     * Index of the requested page, where one corresponds to the first page.
     * @type {number}
     * @memberof ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response
     */
    'page'?: number;
    /**
     * Number of items contained in the returned page.
     * @type {number}
     * @memberof ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response
     */
    'size'?: number;
    /**
     * Total number of items of the collection.
     * @type {number}
     * @memberof ApiClustersMgmtV1ClustersClusterIdExternalConfigurationSyncsetsGet200Response
     */
    'total'?: number;
}
