import * as React from 'react';
import { AgentClusterInstallK8sResource, AgentK8sResource } from '../../types';
import { Alert, Button, Modal, Stack, StackItem } from '@patternfly/react-core';
import { appendPatch } from '../../utils';
import { getErrorMessage } from '../../../common/utils';
import { useStateSafely, useTranslation } from '../../../common';
import { getAgentClusterInstallOfAgent } from '../helpers';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { AgentModel } from '../../types/models';
import { getAgentName, setProvisionRequirements } from './utils';

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
      if (agent.spec?.clusterDeploymentName?.name) {
        if (agentClusterInstall) {
          const masterCount = undefined; /* Only workers can be removed */
          const workerCount = agentClusterInstall.spec?.provisionRequirements.workerAgents || 1;
          await setProvisionRequirements(
            agentClusterInstall,
            Math.max(0, workerCount - 1),
            masterCount,
          );
        }

        const patches: Patch[] = [];
        appendPatch(patches, '/spec/clusterDeploymentName', null, agent.spec.clusterDeploymentName);
        appendPatch(patches, '/spec/role', '', agent.spec.role);
        await k8sPatch({
          model: AgentModel,
          resource: agent,
          data: patches,
        });
      }
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
