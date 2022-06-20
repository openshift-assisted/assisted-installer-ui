import {
  Button,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import * as React from 'react';
import { AgentK8sResource, ClusterImageSetK8sResource } from '../../../types';
import { getOCPVersions } from '../../helpers';
import { AGENT_TO_NODE_POOL_NAME, AGENT_TO_NODE_POOL_NS } from '../HostedClusterWizard';
import { HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import AddNodePoolForm, { AddNodePoolFormValues } from './AddNodePoolForm';

type AddNodePoolModalProps = {
  agentsNamespace: string;
  onSubmit: (
    nodePool: NodePoolK8sResource,
    selectedAgents: AgentK8sResource[],
    matchLabels: { [key: string]: string },
  ) => Promise<void>;
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
  const namespaceAgents = agents.filter((a) => a.metadata?.namespace === agentsNamespace);
  const handleSubmit = async (values: AddNodePoolFormValues) => {
    const matchLabels = {
      [AGENT_TO_NODE_POOL_NAME]: values.nodePoolName,
      [AGENT_TO_NODE_POOL_NS]: hostedCluster.metadata?.namespace || '',
    };
    const selectedAgents = namespaceAgents.filter((a) =>
      (values.manualHostSelect ? values.selectedAgentIDs : values.autoSelectedAgentIDs).includes(
        a.metadata?.uid || '',
      ),
    );
    const nodePool: NodePoolK8sResource = {
      apiVersion: 'hypershift.openshift.io/v1alpha1',
      kind: 'NodePool',
      metadata: {
        name: values.nodePoolName,
        namespace: hostedCluster.metadata?.namespace,
      },
      spec: {
        clusterName: hostedCluster.metadata?.name || '',
        replicas: selectedAgents.length,
        management: {
          autoRepair: false,
          upgradeType: 'InPlace',
        },
        platform: {
          type: 'Agent',
          agent: {
            agentLabelSelector: {
              matchLabels,
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
    await onSubmit(nodePool, selectedAgents, matchLabels);
    onClose();
  };

  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);

  return (
    <Modal
      aria-label="add node pool dialog"
      title="Add Nodepool"
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
      id="add-node-pool"
    >
      <Formik<AddNodePoolFormValues>
        initialValues={{
          nodePoolName: `nodepool-${hostedCluster.metadata?.name || ''}-${Math.floor(
            Math.random() * 100,
          )}`,
          agentLabels: [],
          manualHostSelect: false,
          autoSelectedAgentIDs: [],
          count: 1,
          selectedAgentIDs: [],
          openshiftVersion: ocpVersions[0].value,
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm, values }) => (
          <>
            <ModalBoxBody>
              <AddNodePoolForm
                agents={namespaceAgents}
                hostedCluster={hostedCluster}
                ocpVersions={ocpVersions}
              />
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                onClick={submitForm}
                isDisabled={
                  !isValid ||
                  isSubmitting ||
                  !(values.manualHostSelect ? values.selectedAgentIDs : values.autoSelectedAgentIDs)
                    .length
                }
                icon={isSubmitting ? <Spinner size="md" /> : undefined}
              >
                Create
              </Button>
              <Button variant="link" onClick={onClose}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default AddNodePoolModal;
