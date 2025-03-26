const DEFAULT_OPENSHIFT_DOCS_VERSION = 4.15;

export const getShortOpenshiftVersion = (ocpVersion?: string) => {
  if (!ocpVersion) {
    return DEFAULT_OPENSHIFT_DOCS_VERSION;
  }
  const versionXY = Number(ocpVersion.split('.').slice(0, 2).join('.'));
  if (!Number.isFinite(versionXY)) {
    return DEFAULT_OPENSHIFT_DOCS_VERSION;
  }
  return versionXY < 4.14 ? 4.14 : versionXY;
};

export const getYearForAssistedInstallerDocumentationLink = () => {
  return new Date().getFullYear();
};

export const ASSISTED_INSTALLER_DOCUMENTATION_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html/installing_openshift_container_platform_with_the_assisted_installer/index`;

//New cluster page
export const OPENSHIFT_LIFE_CYCLE_DATES_LINK =
  'https://access.redhat.com/support/policy/updates/openshift#dates';

export const TECH_SUPPORT_LEVEL_LINK = 'https://access.redhat.com/support/offerings/techpreview';

export const DEVELOPER_SUPPORT_LEVEL_LINK =
  'https://access.redhat.com/support/offerings/devpreview';

export const CLUSTER_MANAGER_SITE_LINK = 'https://console.redhat.com/openshift/install/pull-secret';

export const PULL_SECRET_INFO_LINK = CLUSTER_MANAGER_SITE_LINK;

export const getEncryptingDiskDuringInstallationDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installation_configuration/installing-customizing#installation-special-config-encrypt-disk_installing-customizing`;

//Networking page
export const getOpenShiftNetworkingDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing_on_bare_metal/${
    getShortOpenshiftVersion(ocpVersion) > 4.17
      ? 'user-provisioned-infrastructure'
      : 'installing-bare-metal'
  }#installation-network-user-infra_installing-bare-metal`;

export const SSH_GENERATION_DOC_LINK = 'https://www.redhat.com/sysadmin/configure-ssh-keygen';

//Hosts status
export const getOcpConsoleNodesPage = (ocpConsoleUrl: string) =>
  `${ocpConsoleUrl}/k8s/cluster/nodes`;

export const getApproveNodesInClLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing_on_any_platform/installing-platform-agnostic#installation-approve-csrs_installing-platform-agnostic`;

//Static Ip configuration
export const NMSTATE_EXAMPLES_LINK = 'https://nmstate.io/examples.html';

export const getOCPStaticIPDocLink = (docVersion = '2.8') =>
  `https://docs.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/${docVersion}/html-single/clusters/index#on-prem-creating-your-cluster-with-the-cli-nmstateconfig`;

//Platform integration
export const NUTANIX_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#assembly_installing-on-nutanix`;

export const VSPHERE_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#adding-hosts-on-vsphere_installing-on-vsphere`;

export const OCI_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#installing-on-oci`;

export const HOW_TO_KNOW_IF_CLUSTER_SUPPORTS_MULTIPLE_CPU_ARCHS = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html/installing_openshift_container_platform_with_the_assisted_installer/expanding-the-cluster#checking-for-multiple-architectures_expanding-the-cluster`;

export const OCP_RELEASES_PAGE = 'openshift/releases';

//Host requirements
export const DISK_WRITE_SPEED_LINK = 'https://access.redhat.com/solutions/4885641';

export const HOST_REQUIREMENTS_LINK = 'https://access.redhat.com/solutions/4885641';

//Operators page
export const ODF_REQUIREMENTS_LINK =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_data_foundation';

export const OPENSHIFT_AI_REQUIREMENTS_LINK =
  'https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/2.16/html/installing_and_uninstalling_openshift_ai_self-managed/installing-and-deploying-openshift-ai_install#requirements-for-openshift-ai-self-managed_install';

export const OSC_REQUIREMENTS_LINK =
  'https://docs.redhat.com/en/documentation/openshift_sandboxed_containers/1.8/html/user_guide/deploying-osc-bare-metal#osc-resource-requirements_deploying-bare-metal';

export const CNV_LINK = 'https://cloud.redhat.com/learn/topics/virtualization/';

export const ODF_LINK = 'https://www.redhat.com/en/resources/openshift-data-foundation-datasheet';

export const getMceDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/architecture/about-the-multicluster-engine-for-kubernetes-operator`;

export const getLvmsDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/storage/configuring-persistent-storage#overview-of-lvm-storage-functionality_ways-to-provision-local-storage`;

//Others
export const REDHAT_CONSOLE_OPENSHIFT = 'https://console.redhat.com/openshift';

export const getReportIssueLink = () =>
  'https://issues.redhat.com/secure/CreateIssue!default.jspa?pid=12332330&issuetype=1&components=12370775';

export const FEEDBACK_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfg9M8wRW4m_HkWeAl6KpB5dTcMu8iI3iJ29GlLfZpF2hnjng/viewform';

export const CHANGE_ISO_PASSWORD_FILE_LINK =
  'https://raw.githubusercontent.com/openshift/assisted-service/master/docs/change-iso-password.sh';

export const getCiscoIntersightLink = (downloadIsoUrl: string) =>
  `https://www.intersight.com/an/workflow/workflow-definitions/execute/AddServersFromISO?_workflow_Version=1&IsoUrl=${downloadIsoUrl}`;

export const MTV_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.7/';

export const OPENSHIFT_AI_LINK =
  'https://www.redhat.com/en/technologies/cloud-computing/openshift/openshift-ai';

export const OSC_LINK = 'https://docs.redhat.com/en/documentation/openshift_sandboxed_containers';

export const getMtuLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/networking/changing-cluster-network-mtu#nw-cluster-mtu-change-about_changing-cluster-network-mtu`;

export const AUTHORINO_OPERATOR_LINK = 'https://github.com/Kuadrant/authorino-operator';

export const getLsoLink = (ocpVersion?: string) =>
  `https://docs.openshift.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/storage/persistent_storage/persistent_storage_local/ways-to-provision-local-storage.html`;

export const getNmstateLink = (ocpVersion?: string) =>
  `https://docs.openshift.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/networking/networking_operators/k8s-nmstate-about-the-k8s-nmstate-operator.html`;

export const getNodeFeatureDiscoveryLink = (ocpVersion?: string) =>
  `https://docs.openshift.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/hardware_enablement/psap-node-feature-discovery-operator.html`;

export const getNvidiaGpuLink = (ocpVersion?: string) =>
  `https://docs.openshift.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/virt/virtual_machines/advanced_vm_management/virt-configuring-virtual-gpus.html`;

export const PIPELINES_OPERATOR_LINK =
  'https://docs.openshift.com/pipelines/1.17/install_config/installing-pipelines.html';

export const getServiceMeshLink = (ocpVersion?: string) =>
  `https://docs.openshift.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/service_mesh/v1x/preparing-ossm-installation.html`;

export const SERVERLESS_OPERATOR_LINK =
  'https://docs.openshift.com/serverless/1.28/install/install-serverless-operator.html#serverless-install-web-console_install-serverless-operator';
