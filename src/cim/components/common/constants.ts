export const AGENT_LOCATION_LABEL_KEY =
  'agentclusterinstalls.extensions.hive.openshift.io/location';

export const AGENT_SELECTOR = 'agentBareMetal-agentSelector-';

export const AGENT_AUTO_SELECT_ANNOTATION_KEY = `agentBareMetal-agentSelector/autoSelect`;

export const AGENT_NOLOCATION_VALUE = 'NOLOCATION';

export const INFRAENV_AGENTINSTALL_LABEL_KEY = 'infraenvs.agent-install.openshift.io';

export const AGENT_BMH_NAME_LABEL_KEY = 'agent-install.openshift.io/bmh';

export const INFRAENV_GENERATED_AI_FLOW = 'agentBareMetal-generated-infraenv-ai-flow'; // mind ai-template.hbs in ACM when changed here

export const CPU_ARCHITECTURE_ANNOTATION_KEY = 'agentBareMetal-cpuArchitecture';

export const getInfraEnvDocs = (docVersion: string) =>
  `https://access.redhat.com/documentation/en-us/red_hat_advanced_cluster_management_for_kubernetes/${docVersion}/html/multicluster_engine/multicluster_engine_overview#enable-cim`;

export const BMH_HOSTNAME_ANNOTATION = 'bmac.agent-install.openshift.io/hostname';
