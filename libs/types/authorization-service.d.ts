export type ObjectReference = {
  href?: string;
  id?: string;
  kind?: string;
};

export type ApiError = ObjectReference & {
  code?: string;
  operation_id?: string;
  reason?: string;
};

export type FeatureReviewResponse = {
  enabled: boolean;
  feature_id: string;
};

export type AccessReviewResponse = {
  account_id?: string;
  action?: AccessReviewResponse.Action;
  allowed: boolean;
  cluster_id?: string;
  cluster_uuid?: string;
  organization_id?: string;
  resource_type?: AccessReviewResponse.ResourceType;
  subscription_id?: string;
};

export namespace AccessReviewResponse {
  export const enum Action {
    GET = 'get',
    LIST = 'list',
    CREATE = 'create',
    DELETE = 'delete',
    UPDATE = 'update',
  }

  export const enum ResourceType {
    ADD_ON = 'AddOn',
    FLAVOUR = 'Flavour',
    ACCOUNT = 'Account',
    ACCOUNT_POOL = 'AccountPool',
    CLUSTER = 'Cluster',
    PLAN = 'Plan',
    SUBSCRIPTION = 'Subscription',
    ORGANIZATION = 'Organization',
    ROLE = 'Role',
    PERMISSION = 'Permission',
    ROLE_BINDING = 'RoleBinding',
    REGISTRY = 'Registry',
    REGISTRY_CREDENTIAL = 'RegistryCredential',
    CURRENT_ACCOUNT = 'CurrentAccount',
    ACCESS_REVIEW = 'AccessReview',
    SELF_ACCCESS_REVIEW = 'SelfAcccessReview',
    RESOURCE_REVIEW = 'ResourceReview',
    SELF_RESOURCE_REVIEW = 'SelfResourceReview',
    CLUSTER_REGISTRATION = 'ClusterRegistration',
    ACCESS_TOKEN = 'AccessToken',
    CLUSTER_AUTHORIZATION = 'ClusterAuthorization',
    SELF_MANAGED_CLUSTER = 'SelfManagedCluster',
    REDHAT_MANAGED_CLUSTER = 'RedhatManagedCluster',
    EXPORT_CONTROL_REVIEW = 'ExportControlReview',
    CLUSTER_LOG = 'ClusterLog',
    CLUSTER_CREDENTIAL = 'ClusterCredential',
    CLUSTER_METRIC = 'ClusterMetric',
    RESOURCE_QUOTA = 'ResourceQuota',
    RESERVED_RESOURCE = 'ReservedResource',
    DASHBOARD = 'Dashboard',
    CLUSTER_PROVIDER_AND_REGION = 'ClusterProviderAndRegion',
    SERVICE_LOG = 'ServiceLog',
    INTERNAL_SERVICE_LOG = 'InternalServiceLog',
    CSLOGS = 'CSLogs',
    SUBSCRIPTION_LABEL = 'SubscriptionLabel',
    ORGANIZATION_LABEL = 'OrganizationLabel',
    SUBSCRIPTION_LABEL_INTERNAL = 'SubscriptionLabelInternal',
    SELF_ACCESS_REVIEW = 'SelfAccessReview',
    SUBSCRIPTION_INTERNAL = 'SubscriptionInternal',
    SUBSCRIPTION_ROLE_BINDING = 'SubscriptionRoleBinding',
  }
}

export type SelfAccessReview = {
  action: SelfAccessReview.Action;
  cluster_id?: string;
  cluster_uuid?: string;
  organization_id?: string;
  resource_type: SelfAccessReview.ResourceType;
  subscription_id?: string;
};

export namespace SelfAccessReview {
  export const enum Action {
    GET = 'get',
    LIST = 'list',
    CREATE = 'create',
    DELETE = 'delete',
    UPDATE = 'update',
  }

  export const enum ResourceType {
    ADD_ON = 'AddOn',
    FLAVOUR = 'Flavour',
    ACCOUNT = 'Account',
    ACCOUNT_POOL = 'AccountPool',
    CLUSTER = 'Cluster',
    IDP = 'Idp',
    PLAN = 'Plan',
    SUBSCRIPTION = 'Subscription',
    ORGANIZATION = 'Organization',
    ROLE = 'Role',
    PERMISSION = 'Permission',
    ROLE_BINDING = 'RoleBinding',
    REGISTRY = 'Registry',
    REGISTRY_CREDENTIAL = 'RegistryCredential',
    CURRENT_ACCOUNT = 'CurrentAccount',
    ACCESS_REVIEW = 'AccessReview',
    SELF_ACCCESS_REVIEW = 'SelfAcccessReview',
    RESOURCE_REVIEW = 'ResourceReview',
    SELF_RESOURCE_REVIEW = 'SelfResourceReview',
    CLUSTER_REGISTRATION = 'ClusterRegistration',
    ACCESS_TOKEN = 'AccessToken',
    CLUSTER_AUTHORIZATION = 'ClusterAuthorization',
    SELF_MANAGED_CLUSTER = 'SelfManagedCluster',
    REDHAT_MANAGED_CLUSTER = 'RedhatManagedCluster',
    EXPORT_CONTROL_REVIEW = 'ExportControlReview',
    CLUSTER_LOG = 'ClusterLog',
    CLUSTER_CREDENTIAL = 'ClusterCredential',
    CLUSTER_METRIC = 'ClusterMetric',
    CLUSTER_AUTOSCALER = 'ClusterAutoscaler',
    RESOURCE_QUOTA = 'ResourceQuota',
    RESERVED_RESOURCE = 'ReservedResource',
    DASHBOARD = 'Dashboard',
    CLUSTER_PROVIDER_AND_REGION = 'ClusterProviderAndRegion',
    SERVICE_LOG = 'ServiceLog',
    INTERNAL_SERVICE_LOG = 'InternalServiceLog',
    CSLOGS = 'CSLogs',
    SUBSCRIPTION_LABEL = 'SubscriptionLabel',
    ORGANIZATION_LABEL = 'OrganizationLabel',
    SUBSCRIPTION_LABEL_INTERNAL = 'SubscriptionLabelInternal',
    SELF_ACCESS_REVIEW = 'SelfAccessReview',
    SUBSCRIPTION_INTERNAL = 'SubscriptionInternal',
    SUBSCRIPTION_ROLE_BINDING = 'SubscriptionRoleBinding',
    MACHINE_POOL = 'MachinePool',
  }
}
