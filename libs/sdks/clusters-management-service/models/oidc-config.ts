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
 * Contains the necessary attributes to support oidc configuration hosting under Red Hat or registering a Customer\'s byo oidc config.
 * @export
 * @interface OidcConfig
 */
export interface OidcConfig {
    /**
     * HREF for the oidc config, filled in response.
     * @type {string}
     * @memberof OidcConfig
     */
    'href'?: string;
    /**
     * ID for the oidc config, filled in response.
     * @type {string}
     * @memberof OidcConfig
     */
    'id'?: string;
    /**
     * Creation timestamp, filled in response.
     * @type {string}
     * @memberof OidcConfig
     */
    'creation_timestamp'?: string;
    /**
     * ARN of the AWS role to assume when installing the cluster as to reveal the secret, supplied in request. It is only to be used in Unmanaged Oidc Config.
     * @type {string}
     * @memberof OidcConfig
     */
    'installer_role_arn'?: string;
    /**
     * Issuer URL, filled in response when Managed and supplied in Unmanaged.
     * @type {string}
     * @memberof OidcConfig
     */
    'issuer_url'?: string;
    /**
     * Last update timestamp, filled when patching a valid attribute of this oidc config.
     * @type {string}
     * @memberof OidcConfig
     */
    'last_update_timestamp'?: string;
    /**
     * Last used timestamp, filled by the latest cluster that used this oidc config.
     * @type {string}
     * @memberof OidcConfig
     */
    'last_used_timestamp'?: string;
    /**
     * Indicates whether it is Managed or Unmanaged (Customer hosted).
     * @type {boolean}
     * @memberof OidcConfig
     */
    'managed'?: boolean;
    /**
     * Organization ID, filled in response respecting token provided.
     * @type {string}
     * @memberof OidcConfig
     */
    'organization_id'?: string;
    /**
     * Indicates whether the Oidc Config can be reused.
     * @type {boolean}
     * @memberof OidcConfig
     */
    'reusable'?: boolean;
    /**
     * Secrets Manager ARN for the OIDC private key, supplied in request. It is only to be used in Unmanaged Oidc Config.
     * @type {string}
     * @memberof OidcConfig
     */
    'secret_arn'?: string;
}
