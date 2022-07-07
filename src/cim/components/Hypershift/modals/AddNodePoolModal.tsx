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
import { Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../../common/utils';
import { AgentK8sResource, ClusterImageSetK8sResource } from '../../../types';
import { getOCPVersions } from '../../helpers';
import { HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import { formikLabelsToLabels } from '../utils';
import NodePoolForm, { NodePoolFormValues } from './NodePoolForm';

type AddNodePoolModalProps = {
  agentsNamespace: string;
  onSubmit: (nodePool: NodePoolK8sResource) => Promise<void>;
  onClose: VoidFunction;
  agents: AgentK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  clusterImages: ClusterImageSetK8sResource[];
};

const AddNodePoolModal = ({
  onSubmit,
  onClose,
  agents,
  hostedCluster,
  clusterImages,
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
          image:
            clusterImages.find((ci) => ci.metadata?.name === values.openshiftVersion)?.spec
              ?.releaseImage || '',
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

  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);

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
          openshiftVersion: ocpVersions[0].value,
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <NodePoolForm
                    agents={namespaceAgents}
                    hostedCluster={hostedCluster}
                    ocpVersions={ocpVersions}
                  />
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
