import {
  Alert,
  Button,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikConfig } from 'formik';
import * as React from 'react';
import { AgentK8sResource } from '../../../types';
import { NodePoolK8sResource, HostedClusterK8sResource, AgentMachineK8sResource } from '../types';
import NodePoolForm, { NodePoolFormValues } from './NodePoolForm';
import { labelsToFormikValue } from '../utils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../../common/utils';

type ManageHostsModalProps = {
  hostedCluster: HostedClusterK8sResource;
  agents: AgentK8sResource[];
  nodePool: NodePoolK8sResource;
  onClose: VoidFunction;
  onSubmit: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: {
      op: string;
      value?: unknown;
      path: string;
    }[],
  ) => Promise<unknown>;
  agentMachines: AgentMachineK8sResource[];
};

const getPatches = (values: NodePoolFormValues, nodePool: NodePoolK8sResource) => {
  const patches = [];

  if (values.useAutoscaling && !nodePool.spec.autoScaling) {
    patches.push(
      { op: 'remove', path: '/spec/replicas' },
      {
        op: 'add',
        value: {
          min: values.autoscaling?.minReplicas,
          max: values.autoscaling?.maxReplicas,
        },
        path: '/spec/autoScaling',
      },
    );
  } else if (!values.useAutoscaling && !nodePool.spec.replicas) {
    patches.push(
      { op: 'remove', path: '/spec/autoScaling' },
      {
        op: 'add',
        value: values.count,
        path: '/spec/replicas',
      },
    );
  }

  if (values.count !== nodePool.spec.replicas) {
    patches.push({
      op: 'replace',
      value: values.count,
      path: '/spec/replicas',
    });
  }
  if (
    values.useAutoscaling &&
    (values.autoscaling?.minReplicas !== nodePool.spec.autoScaling?.min ||
      values.autoscaling?.maxReplicas !== nodePool.spec.autoScaling?.max)
  ) {
    patches.push({
      op: 'replace',
      value: {
        min: values.autoscaling?.minReplicas,
        max: values.autoscaling?.maxReplicas,
      },
      path: '/spec/autoScaling',
    });
  }
  return patches;
};

const ManageHostsModal = ({
  onClose,
  nodePool,
  hostedCluster,
  agents,
  onSubmit,
  agentMachines,
}: ManageHostsModalProps) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const namespaceAgents = agents.filter(
    (a) => a.metadata?.namespace === hostedCluster.spec.platform.agent?.agentNamespace,
  );

  const handleSubmit: FormikConfig<NodePoolFormValues>['onSubmit'] = async (values) => {
    setError(undefined);
    const patches = getPatches(values, nodePool);

    try {
      await onSubmit(nodePool, patches);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      aria-label="Manage hosts dialog"
      title={t('ai:Manage hosts')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
    >
      <Formik<NodePoolFormValues>
        initialValues={{
          nodePoolName: nodePool.metadata?.name || '',
          agentLabels: labelsToFormikValue(
            nodePool.spec.platform?.agent?.agentLabelSelector?.matchLabels || {},
          ),
          count: nodePool.spec.replicas,
          useAutoscaling: !!nodePool.spec.autoScaling,
          autoscaling: nodePool.spec.autoScaling && {
            minReplicas: nodePool.spec.autoScaling.min,
            maxReplicas: nodePool.spec.autoScaling.max,
          },
        }}
        isInitialValid={false}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <NodePoolForm
                    agents={namespaceAgents}
                    agentMachines={agentMachines}
                    nodePool={nodePool}
                    hostedCluster={hostedCluster}
                  />
                </StackItem>
                {error && (
                  <StackItem>
                    <Alert variant="danger" title={error} isInline />
                  </StackItem>
                )}
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={submitForm}
                isDisabled={!isValid || isSubmitting}
                icon={isSubmitting ? <Spinner size="md" /> : undefined}
              >
                {t('ai:Update')}
              </Button>
              <Button variant="link" onClick={onClose}>
                {t('ai:Cancel')}
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default ManageHostsModal;
