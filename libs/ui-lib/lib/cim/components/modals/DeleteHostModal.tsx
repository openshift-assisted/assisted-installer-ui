import * as React from 'react';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  BareMetalHostK8sResource,
  NMStateK8sResource,
} from '../../types';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common';
import { deleteHost, getAgentName } from './utils';

const DeleteHostModal = ({
  agent,
  bmh,
  agentClusterInstall,
  nmStates,
  onClose,
}: {
  agent?: AgentK8sResource;
  bmh?: BareMetalHostK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  nmStates: NMStateK8sResource[];
  onClose: VoidFunction;
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const onDelete = async () => {
    setError(undefined);
    setIsDeleting(true);
    try {
      await deleteHost(agent, bmh, agentClusterInstall, nmStates);
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen
      variant="small"
      title={t('ai:Delete host?')}
      titleIconVariant="warning"
      onClose={isDeleting ? undefined : onClose}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          onClick={() => void onDelete()}
          isDisabled={isDeleting}
          isLoading={isDeleting}
        >
          {t('ai:Confirm')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          {t('ai:Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          {t('ai:Are you sure you want to delete {{name}}?', { name: getAgentName(agent || bmh) })}
        </StackItem>
        {error && (
          <StackItem>
            <Alert variant="danger" isInline title={error} />
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default DeleteHostModal;
