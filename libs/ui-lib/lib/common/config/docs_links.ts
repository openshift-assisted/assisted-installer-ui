const DEFAULT_OPENSHIFT_DOCS_VERSION = '4.15';

export const getShortOpenshiftVersion = (ocpVersion?: string) =>
  ocpVersion ? ocpVersion.split('.').slice(0, 2).join('.') : DEFAULT_OPENSHIFT_DOCS_VERSION;

export const getYearForAssistedInstallerDocumentationLink = () => {
  return new Date().getFullYear();
};

export const ASSISTED_INSTALLER_DOCUMENTATION_LINK = `https://access.redhat.com/documentation/en-us/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html/installing_openshift_container_platform_with_the_assisted_installer/index`;

//New cluster page
export const OPENSHIFT_LIFE_CYCLE_DATES_LINK =
  'https://access.redhat.com/support/policy/updates/openshift#dates';

export const TECH_SUPPORT_LEVEL_LINK = 'https://access.redhat.com/support/offerings/techpreview';

export const CLUSTER_MANAGER_SITE_LINK = 'https://console.redhat.com/openshift/install/pull-secret';

export const PULL_SECRET_INFO_LINK = CLUSTER_MANAGER_SITE_LINK;

export const getEncryptingDiskDuringInstallationDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing/installation-configuration#installation-special-config-encrypt-disk_installing-customizing`;

//Networking page
export const getOpenShiftNetworkingDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing/installing-on-bare-metal#installation-network-user-infra_installing-bare-metal`;

export const SSH_GENERATION_DOC_LINK = 'https://www.redhat.com/sysadmin/configure-ssh-keygen';

//Hosts status
export const getOcpConsoleNodesPage = (ocpConsoleUrl: string) =>
  `${ocpConsoleUrl}/k8s/cluster/nodes`;

export const getApproveNodesInClLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing/installing-on-any-platform#installation-approve-csrs_installing-platform-agnostic`;

//Static Ip configuration
export const NMSTATE_EXAMPLES_LINK = 'https://nmstate.io/examples.html';

export const getOCPStaticIPDocLink = (docVersion = '2.8') =>
  `https://docs.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/${docVersion}/html-single/clusters/index#on-prem-creating-your-cluster-with-the-cli-nmstateconfig`;

//Platform integration
export const NUTANIX_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#assembly_installing-on-nutanix`;

export const VSPHERE_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#adding-hosts-on-vsphere_installing-on-vsphere`;

export const OCI_CONFIG_LINK = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html-single/installing_openshift_container_platform_with_the_assisted_installer/index#installing-on-oci`;

//Custom manifests
export const CUSTOM_MANIFESTS_HELP_LINK = `https://docs.redhat.com/en/documentation/openshift_container_platform/4.15/html/installing/installation-configuration#installation-special-config-kargs_installing-customizing`;

export const getCustomManifestsDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/installing/installation-configuration#installation-special-config-kargs_installing-customizing`;

export const HOW_TO_KNOW_IF_CLUSTER_SUPPORTS_MULTIPLE_CPU_ARCHS = `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html/installing_openshift_container_platform_with_the_assisted_installer/expanding-the-cluster#checking-for-multiple-architectures_expanding-the-cluster`;

export const OCP_RELEASES_PAGE = 'openshift/releases';

//Host requirements
export const DISK_WRITE_SPEED_LINK = 'https://access.redhat.com/solutions/4885641';

export const HOST_REQUIREMENTS_LINK = 'https://access.redhat.com/solutions/4885641';

//Operators page
export const ODF_REQUIREMENTS_LINK =
  'https://access.redhat.com/documentation/en-us/red_hat_openshift_data_foundation/4.15';

export const CNV_LINK = 'https://cloud.redhat.com/learn/topics/virtualization/';

export const ODF_LINK = 'https://www.redhat.com/en/resources/openshift-data-foundation-datasheet';

export const getMceDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/en/documentation/openshift_container_platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/html/architecture/about-the-multicluster-engine-for-kubernetes-operator`;

export const getLvmsDocsLink = (ocpVersion?: string) =>
  `https://docs.redhat.com/container-platform/${getShortOpenshiftVersion(
    ocpVersion,
  )}/storage/persistent_storage/persistent_storage_local/persistent-storage-using-lvms.html`;

//Others
export const REDHAT_CONSOLE_OPENSHIFT = 'https://console.redhat.com/openshift';

export const getReportIssueLink = () =>
  'https://issues.redhat.com/secure/CreateIssue!default.jspa?pid=12332330&issuetype=1&components=12370775';

export const FEEDBACK_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfg9M8wRW4m_HkWeAl6KpB5dTcMu8iI3iJ29GlLfZpF2hnjng/viewform';

export const CHANGE_ISO_PASSWORD_FILE_LINK =
  'https://raw.githubusercontent.com/openshift/assisted-service/master/docs/change-iso-password.sh';
