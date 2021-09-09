export const AGENT_LOCATION_LABEL_KEY =
  'agentclusterinstalls.extensions.hive.openshift.io/location';

export const AGENT_SELECTOR = 'agentBareMetal-agentSelector-';

export const AGENT_AUTO_SELECT_ANNOTATION_KEY = `agentBareMetal-agentSelector/autoSelect`;

export const AGENT_NOLOCATION_VALUE = 'NOLOCATION';

// We need that in addition to the AgentClusterInstall's clusterDeploymentRefName
// since the agentSelector in clusterDeployment expects exact match on the hosts included in the installation
export const RESERVED_AGENT_LABEL_KEY = 'agentclusterinstalls.extensions.hive.openshift.io/cluster';

export const INFRAENV_AGENTINSTALL_LABEL_KEY = 'infraenvs.agent-install.openshift.io';
