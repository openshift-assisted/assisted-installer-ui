import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { Host, Inventory, Cluster } from '../../api/types';
import EditHostForm from './EditHostForm';

type EditHostModalProps = {
  host?: Host;
  inventory?: Inventory;
  isOpen: boolean;
  cluster: Cluster;
  onClose: () => void;
  onSave: () => void;
};

const EditHostModal: React.FC<EditHostModalProps> = ({
  isOpen,
  host,
  inventory,
  cluster,
  onClose,
  onSave,
}) =>
  host && inventory ? (
    <Modal
      aria-label="Edit host dialog"
      title="Edit Host"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <EditHostForm
        host={host}
        inventory={inventory}
        cluster={cluster}
        onCancel={onClose}
        onSuccess={onSave}
      />
    </Modal>
  ) : null;

export default EditHostModal;
