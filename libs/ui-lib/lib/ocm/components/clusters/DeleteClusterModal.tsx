import * as React from 'react';
import {
	Button
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';

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
    title="Delete cluster"
    isOpen={isOpen}
    onClose={onClose}
    variant={ModalVariant.small}
    showClose={!isDeleteInProgress}
    actions={[
      <Button
        data-testid="delete-cluster-submit"
        key="confirm"
        variant="danger"
        onClick={onDelete}
        isDisabled={isDeleteInProgress}
        isLoading={isDeleteInProgress}
      >
        Delete
      </Button>,
      <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleteInProgress}>
        Cancel
      </Button>,
    ]}
  >
    Are you sure you want to delete cluster {name} ?
  </Modal>
);

export default DeleteClusterModal;
