import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { Host, HostUpdateParams, Inventory } from '../../api';
import EditHostForm, { EditHostFormProps } from './EditHostForm';

type EditHostModalProps = {
  host?: Host;
  inventory?: Inventory;
  isOpen: boolean;
  usedHostnames: string[] | undefined;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (values: HostUpdateParams) => Promise<any>;
  onFormSaveError: EditHostFormProps['onFormSaveError'];
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
        usedHostnames={usedHostnames}
        onCancel={onClose}
        onSave={onSave}
        onFormSaveError={onFormSaveError}
      />
    </Modal>
  ) : null;

export default EditHostModal;
