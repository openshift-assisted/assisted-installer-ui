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
import { AgentK8sResource } from '../../../types';
import { NodePoolK8sResource, HostedClusterK8sResource } from '../types';
import AddNodePoolForm, { AddNodePoolFormValues } from './AddNodePoolForm';
import isMatch from 'lodash/isMatch';

type ManageHostsModalProps = {
  hostedCluster: HostedClusterK8sResource;
  agents: AgentK8sResource[];
  nodePool: NodePoolK8sResource;
  onClose: VoidFunction;
  onSubmit: (selectedAgents: AgentK8sResource[]) => Promise<void>;
};

const ManageHostsModal = ({
  onClose,
  nodePool,
  hostedCluster,
  agents,
  onSubmit,
}: ManageHostsModalProps) => {
  const namespaceAgents = agents.filter(
    (a) => a.metadata?.namespace === hostedCluster.spec.platform.agent?.agentNamespace,
  );
  const handleSubmit = async (values: AddNodePoolFormValues) => {
    try {
      await onSubmit(
        namespaceAgents.filter((a) =>
          (values.manualHostSelect
            ? values.selectedAgentIDs
            : values.autoSelectedAgentIDs
          ).includes(a.metadata?.uid || ''),
        ),
      );
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const nodePoolAgents = namespaceAgents
    .filter((a) =>
      a.metadata?.labels
        ? isMatch(a.metadata.labels, nodePool.spec.platform.agent.agentLabelSelector.matchLabels)
        : false,
    )
    .map((a) => a.metadata?.uid || '');

  return (
    <Modal
      aria-label="Manage hosts dialog"
      title="Manage hosts"
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
      id="manage-hosts-modal"
    >
      <Formik<AddNodePoolFormValues>
        initialValues={{
          nodePoolName: nodePool.metadata?.name || '',
          agentLabels: [],
          manualHostSelect: false,
          autoSelectedAgentIDs: nodePoolAgents,
          count: nodePoolAgents.length,
          selectedAgentIDs: nodePoolAgents,
          openshiftVersion: nodePool.spec.release.image,
        }}
        isInitialValid={false}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalBoxBody>
              <AddNodePoolForm
                agents={namespaceAgents}
                nodePool={nodePool}
                hostedCluster={hostedCluster}
              />
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                onClick={submitForm}
                isDisabled={!isValid || isSubmitting}
                icon={isSubmitting ? <Spinner size="md" /> : undefined}
              >
                Update
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

export default ManageHostsModal;
