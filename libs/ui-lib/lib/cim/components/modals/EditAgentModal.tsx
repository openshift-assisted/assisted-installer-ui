import * as React from 'react';
import EditHostModal from '../../../common/components/hosts/EditHostModal';
import { EditAgentModalProps } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers/toAssisted';

const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, onSave, ...rest }) => {
  const [host] = agent ? getAIHosts([agent]) : [];
  return (
    <EditHostModal
      host={host}
      inventory={agent?.status?.inventory}
      {...rest}
      onSave={async ({ hostname }) => {
        agent && (await onSave(agent, hostname));
        rest.onClose();
      }}
    />
  );
};

export default EditAgentModal;
