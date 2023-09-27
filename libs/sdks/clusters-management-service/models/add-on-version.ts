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
import { AddOnConfig } from './add-on-config';
// May contain unused imports in some cases
// @ts-ignore
import { AddOnParameter } from './add-on-parameter';
// May contain unused imports in some cases
// @ts-ignore
import { AddOnRequirement } from './add-on-requirement';
// May contain unused imports in some cases
// @ts-ignore
import { AddOnSubOperator } from './add-on-sub-operator';
// May contain unused imports in some cases
// @ts-ignore
import { AdditionalCatalogSource } from './additional-catalog-source';

/**
 * Representation of an add-on version.
 * @export
 * @interface AddOnVersion
 */
export interface AddOnVersion {
    /**
     * Indicates the type of this object. Will be \'AddOnVersion\' if this is a complete object or \'AddOnVersionLink\' if it is just a link.
     * @type {string}
     * @memberof AddOnVersion
     */
    'kind'?: string;
    /**
     * Unique identifier of the object.
     * @type {string}
     * @memberof AddOnVersion
     */
    'id'?: string;
    /**
     * Self link.
     * @type {string}
     * @memberof AddOnVersion
     */
    'href'?: string;
    /**
     * Additional catalog sources associated with this addon version
     * @type {Array<AdditionalCatalogSource>}
     * @memberof AddOnVersion
     */
    'additional_catalog_sources'?: Array<AdditionalCatalogSource>;
    /**
     * AvailableUpgrades is the list of versions this version can be upgraded to.
     * @type {Array<string>}
     * @memberof AddOnVersion
     */
    'available_upgrades'?: Array<string>;
    /**
     * The specific addon catalog source channel of packages
     * @type {string}
     * @memberof AddOnVersion
     */
    'channel'?: string;
    /**
     * 
     * @type {AddOnConfig}
     * @memberof AddOnVersion
     */
    'config'?: AddOnConfig;
    /**
     * Indicates if this add-on version can be added to clusters.
     * @type {boolean}
     * @memberof AddOnVersion
     */
    'enabled'?: boolean;
    /**
     * List of parameters for this add-on version.
     * @type {Array<AddOnParameter>}
     * @memberof AddOnVersion
     */
    'parameters'?: Array<AddOnParameter>;
    /**
     * The pull secret name used for this addon version.
     * @type {string}
     * @memberof AddOnVersion
     */
    'pull_secret_name'?: string;
    /**
     * List of requirements for this add-on version.
     * @type {Array<AddOnRequirement>}
     * @memberof AddOnVersion
     */
    'requirements'?: Array<AddOnRequirement>;
    /**
     * The catalog source image for this add-on version.
     * @type {string}
     * @memberof AddOnVersion
     */
    'source_image'?: string;
    /**
     * List of sub operators for this add-on version.
     * @type {Array<AddOnSubOperator>}
     * @memberof AddOnVersion
     */
    'sub_operators'?: Array<AddOnSubOperator>;
}
