import * as React from 'react';
import {
	Alert,
	Button,
	Spinner,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { Formik } from 'formik';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../../common/utils';
import { AgentK8sResource, ConfigMapK8sResource } from '../../../types';
import { HostedClusterK8sResource, NodePoolFormValues, NodePoolK8sResource } from '../types';
import { formikLabelsToLabels } from '../utils';
import NodePoolForm from './NodePoolForm';

type AddNodePoolModalProps = {
  agentsNamespace: string;
  onSubmit: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onClose: VoidFunction;
  agents: AgentK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  supportedVersionsCM?: ConfigMapK8sResource;
};

const AddNodePoolModal = ({
  onSubmit,
  onClose,
  agents,
  hostedCluster,
  agentsNamespace,
}: AddNodePoolModalProps) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const namespaceAgents = agents.filter((a) => a.metadata?.namespace === agentsNamespace);
  const handleSubmit = async (values: NodePoolFormValues) => {
    setError(undefined);
    const nodePool: NodePoolK8sResource = {
      apiVersion: 'hypershift.openshift.io/v1alpha1',
      kind: 'NodePool',
      metadata: {
        name: values.nodePoolName,
        namespace: hostedCluster.metadata?.namespace,
      },
      spec: {
        clusterName: hostedCluster.metadata?.name || '',
        replicas: values.count,
        management: {
          autoRepair: false,
          upgradeType: 'InPlace',
        },
        platform: {
          type: 'Agent',
          agent: {
            agentLabelSelector: {
              matchLabels: formikLabelsToLabels(values.agentLabels),
            },
          },
        },
        release: {
          image: hostedCluster.spec.release.image,
        },
      },
    };
    try {
      await onSubmit(nodePool);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      aria-label="add node pool dialog"
      title={t('ai:Add Nodepool')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
    >
      <Formik<NodePoolFormValues>
        initialValues={{
          nodePoolName: `nodepool-${hostedCluster.metadata?.name || ''}-${Math.floor(
            Math.random() * 100,
          )}`,
          agentLabels: [],
          count: 1,
          useAutoscaling: false,
          autoscaling: {
            minReplicas: 1,
            maxReplicas: 1,
          },
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <NodePoolForm agents={namespaceAgents} hostedCluster={hostedCluster} />
                </StackItem>
                {error && (
                  <StackItem>
                    <Alert variant="danger" isInline title={error} />
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
                {t('ai:Create')}
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

export default AddNodePoolModal;
