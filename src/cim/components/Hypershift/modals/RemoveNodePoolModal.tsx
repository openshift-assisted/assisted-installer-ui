import * as React from 'react';
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
import { NodePoolK8sResource } from '../types';
import { getErrorMessage } from '../../../../common/utils';

type RemoveNodePoolModalProps = {
  nodePool: NodePoolK8sResource;
  onClose: VoidFunction;
  onRemove: (nodePool: NodePoolK8sResource) => Promise<unknown>;
};

const RemoveNodePoolModal = ({ onClose, onRemove, nodePool }: RemoveNodePoolModalProps) => {
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <Modal
      aria-label="remove node pool dialog"
      title="Remove Nodepool"
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="remove-node-pool"
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            {`Removing ${nodePool.metadata?.name || ''} will remove the association with ${
              nodePool.spec.replicas
            } ${
              nodePool.spec.replicas === 1 ? 'host' : 'hosts'
            }. These hosts will become available for other nodepools.`}
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
          onClick={() => {
            const remove = async () => {
              try {
                setError(undefined);
                setIsRemoving(true);
                await onRemove(nodePool);
                onClose();
              } catch (err) {
                setError(getErrorMessage(err));
              } finally {
                setIsRemoving(false);
              }
            };
            void remove();
          }}
          isDisabled={isRemoving}
          variant="danger"
          icon={isRemoving ? <Spinner size="md" /> : undefined}
        >
          Create
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default RemoveNodePoolModal;
