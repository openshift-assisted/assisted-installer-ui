import * as React from 'react';
import { EditHostModal } from '../../../common';
import { EditHostFormProps } from '../../../common/components/hosts/EditHostForm';
import { AgentK8sResource } from '../../types';
import { getAIHosts } from '../helpers/toAssisted';

type EditAgentModalProps = {
  agent: AgentK8sResource | undefined;
  isOpen: boolean;
  usedHostnames: string[] | undefined;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (agent: AgentK8sResource, hostname: string) => Promise<any>;
  onFormSaveError: EditHostFormProps['onFormSaveError'];
};

const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, onSave, ...rest }) => {
  const [host] = agent ? getAIHosts([agent]) : [];
  return (
    <EditHostModal
      host={host}
      inventory={agent?.status?.inventory}
      {...rest}
      onSave={async ({ hostname }) => agent && onSave(agent, hostname)}
    />
  );
};

export default EditAgentModal;
