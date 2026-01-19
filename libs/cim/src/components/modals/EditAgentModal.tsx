import * as React from 'react';
import EditHostModal from '@openshift-assisted/common/components/hosts/EditHostModal';
import { EditAgentModalProps } from '../ClusterDeployment/types';
import { getAIHosts } from '../helpers/toAssisted';

const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, onSave, ...rest }) => {
  const [host] = agent ? getAIHosts([agent]) : [];
  return (
    <EditHostModal
      isOpen
      host={host}
      inventory={agent?.status?.inventory}
      {...rest}
      onSave={async ({ hostname }) => {
        agent && (await onSave(host, hostname));
        rest.onClose();
      }}
    />
  );
};

export default EditAgentModal;
