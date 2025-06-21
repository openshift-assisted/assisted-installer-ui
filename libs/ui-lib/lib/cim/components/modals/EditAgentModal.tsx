import * as React from 'react';
import EditHostModal from '../../../common/components/hosts/EditHostModal';
import { getAIHosts } from '../helpers/toAssisted';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { getAgentsHostsNames } from '../ClusterDeployment/helpers';
import { onAgentChangeHostname } from '../helpers';

export type EditAgentModalProps = {
  agent: AgentK8sResource;
  agents: AgentK8sResource[];
  bmhs: BareMetalHostK8sResource[];
  onClose: () => void;
};

const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, agents, bmhs, onClose }) => {
  const usedHostnames = getAgentsHostsNames(agents, bmhs);
  const [host] = agent ? getAIHosts([agent]) : [];
  const onSave = onAgentChangeHostname(agents, bmhs);
  return (
    <EditHostModal
      isOpen
      host={host}
      inventory={agent?.status?.inventory}
      usedHostnames={usedHostnames}
      onSave={async ({ hostname }) => {
        agent && (await onSave(host, hostname));
        onClose();
      }}
      onClose={onClose}
    />
  );
};

export default EditAgentModal;
