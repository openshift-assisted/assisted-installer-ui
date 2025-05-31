import * as React from 'react';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import { getAgentName, onUnbindHost } from '../../utils';
import { getErrorMessage } from '../../../common/utils';
import { useStateSafely, useTranslation } from '../../../common';
import { getAgentClusterInstallOfAgent } from '../helpers';

const UnbindHostModal = ({
  agent,
  agentClusterInstalls,
  onClose,
}: {
  agent: AgentK8sResource;
  agentClusterInstalls: AgentClusterInstallK8sResource[];
  onClose: VoidFunction;
}) => {
  const { t } = useTranslation();
  const [isUnbinding, setIsUnbinding] = useStateSafely(false);
  const [error, setError] = React.useState<string>();

  const onUnbind = async () => {
    setError(undefined);
    setIsUnbinding(true);
    const agentClusterInstall = getAgentClusterInstallOfAgent(agentClusterInstalls, agent);
    try {
      await onUnbindHost(agent, agentClusterInstall);
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsUnbinding(false);
    }
  };

  return (
    <Modal
      isOpen
      variant="small"
      title={t('ai:Remove host from cluster?')}
      titleIconVariant="warning"
      onClose={isUnbinding ? undefined : onClose}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          onClick={() => void onUnbind()}
          isDisabled={isUnbinding}
          isLoading={isUnbinding}
        >
          {t('ai:Remove from cluster')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isUnbinding}>
          {t('ai:Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <Alert
            variant="info"
            isInline
            title={t(
              'ai:The host will be removed from the cluster but will remain available inside its infrastructure environment. Check its status if further action is needed.',
            )}
          />
        </StackItem>
        <StackItem isFilled>
          {t('ai:Are you sure you want to remove {{name}} host from cluster?', {
            name: getAgentName(agent),
          })}
        </StackItem>
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title={error} />
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default UnbindHostModal;
