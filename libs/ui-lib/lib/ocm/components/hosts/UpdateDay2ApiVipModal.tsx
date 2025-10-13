import React from 'react';
import UpdateDay2ApiVipForm, { UpdateDay2ApiVipFormProps } from './UpdateDay2ApiVipForm';
import { Modal, ModalHeader, ModalVariant } from '@patternfly/react-core';

type UpdateDay2ApiVipModalProps = {
  isOpen: boolean;
} & UpdateDay2ApiVipFormProps;

const UpdateDay2ApiVipModal: React.FC<UpdateDay2ApiVipModalProps> = ({
  isOpen,
  onClose,
  ...props
}) => (
  <Modal
    aria-label="Update cluster hostname"
    isOpen={isOpen}
    variant={ModalVariant.small}
    onClose={onClose}
  >
    <ModalHeader title="Update cluster hostname" />
    <UpdateDay2ApiVipForm {...props} onClose={onClose} />
  </Modal>
);

export default UpdateDay2ApiVipModal;
