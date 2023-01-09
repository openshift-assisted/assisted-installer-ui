// Alternative namespaces:
// assisted-installer: pre-2.3
// open-cluster-management: acm >= 2.3
// rhacm: acm downstream >= 2.3
export const getK8sProxyURL = (aiNamespace = 'open-cluster-management') =>
  `/api/v1/namespaces/${aiNamespace}/services/https:assisted-service:8090/proxy`;
