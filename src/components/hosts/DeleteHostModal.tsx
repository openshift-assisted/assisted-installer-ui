import React from 'react';
import { Modal, Button, ButtonVariant } from '@patternfly/react-core';

type DeleteHostModalProps = {
  hostname?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteHostModal: React.FC<DeleteHostModalProps> = ({
  isOpen,
  hostname,
  onClose,
  onDelete,
}) => (
  <Modal
    title="Delete Host"
    isOpen={isOpen}
    onClose={onClose}
    isFooterLeftAligned
    isSmall
    actions={[
      <Button
        data-test-id="delete-host-submit"
        key="confirm"
        variant={ButtonVariant.danger}
        onClick={onDelete}
      >
        Delete
      </Button>,
      <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    Are you sure you want to delete host{` ${hostname}` || ''} ?
  </Modal>
);

export default DeleteHostModal;
