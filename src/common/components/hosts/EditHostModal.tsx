import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { Host, Inventory } from '../../api';
import EditHostForm, { EditHostFormProps } from './EditHostForm';
import { EditHostFormValues } from './types';

type EditHostModalProps = {
  host?: Host;
  inventory?: Inventory;
  isOpen: boolean;
  usedHostnames: string[] | undefined;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (values: EditHostFormValues) => Promise<any>;
  onFormSaveError?: EditHostFormProps['onFormSaveError'];
};

const EditHostModal: React.FC<EditHostModalProps> = ({
  isOpen,
  host,
  inventory,
  usedHostnames,
  onClose,
  onSave,
  onFormSaveError,
}) =>
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
        onFormSaveError={onFormSaveError}
      />
    </Modal>
  ) : null;

export default EditHostModal;
