import React from 'react';
import { Host, Inventory } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import EditHostForm, { EditHostFormProps } from './EditHostForm';
import { Modal, ModalHeader, ModalVariant } from '@patternfly/react-core';

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
}: EditHostModalProps) => {
  const { t } = useTranslation();

  if (!host || !inventory) {
    return null;
  }

  return (
    <Modal
      aria-label="Change hostname dialog"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
    >
      <ModalHeader title={t('ai:Change hostname')} />
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
  );
};

export default EditHostModal;
