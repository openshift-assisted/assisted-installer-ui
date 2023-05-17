import React from 'react';
import { Modal, ModalVariant, Button, ButtonVariant } from '@patternfly/react-core';

type DeleteHostModalProps = {
  hostname?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
};

const DeleteHostModal = ({ isOpen, hostname, onClose, onDelete }: DeleteHostModalProps) => (
  <Modal
    title="Remove host?"
    isOpen={isOpen}
    onClose={onClose}
    variant={ModalVariant.small}
    actions={[
      <Button
        data-testid="delete-host-submit"
        key="confirm"
        variant={ButtonVariant.danger}
        onClick={onDelete}
      >
        Remove host
      </Button>,
      <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    Host {hostname || ''} will be removed.
  </Modal>
);

export default DeleteHostModal;
