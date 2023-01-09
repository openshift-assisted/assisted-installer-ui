import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { Host, Inventory } from '../../api';
import EditHostForm, { EditHostFormProps } from './EditHostForm';

type EditHostModalProps = Pick<
  EditHostFormProps,
  'usedHostnames' | 'onSave' | 'getEditErrorMessage' | 'onHostSaveError'
> & {
  host?: Host;
  inventory?: Inventory;
  isOpen: boolean;
  onClose: () => void;
};

const EditHostModal = ({
  isOpen,
  host,
  inventory,
  usedHostnames,
  onClose,
  onSave,
  onHostSaveError,
  getEditErrorMessage,
}: EditHostModalProps) =>
  host && inventory ? (
    <Modal
      aria-label="Change hostname dialog"
      title="Change hostname"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <EditHostForm
        host={host}
        inventory={inventory}
        usedHostnames={usedHostnames}
        onCancel={onClose}
        onSave={onSave}
        getEditErrorMessage={getEditErrorMessage}
        onHostSaveError={onHostSaveError}
      />
    </Modal>
  ) : null;

export default EditHostModal;
