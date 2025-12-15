import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

type DeleteClusterModalProps = {
  name: string;
  onClose: () => void;
  onDelete: () => void;
  isOpen: boolean;
  isDeleteInProgress?: boolean;
};

const DeleteClusterModal: React.FC<DeleteClusterModalProps> = ({
  name,
  onClose,
  onDelete,
  isDeleteInProgress,
  isOpen,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={isDeleteInProgress ? undefined : () => onClose()}
    variant={ModalVariant.small}
  >
    <ModalHeader title="Delete cluster" />
    <ModalBody>Are you sure you want to delete cluster {name} ?</ModalBody>
    <ModalFooter>
      <Button
        data-testid="delete-cluster-submit"
        key="confirm"
        variant="danger"
        onClick={onDelete}
        isDisabled={isDeleteInProgress}
        isLoading={isDeleteInProgress}
      >
        Delete
      </Button>
      <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleteInProgress}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default DeleteClusterModal;
