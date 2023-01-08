import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import UpdateDay2ApiVipForm, { UpdateDay2ApiVipFormProps } from './UpdateDay2ApiVipForm';

type UpdateDay2ApiVipModalProps = {
  isOpen: boolean;
} & UpdateDay2ApiVipFormProps;

const UpdateDay2ApiVipModal: React.FC<UpdateDay2ApiVipModalProps> = ({ isOpen, ...props }) => (
  <Modal
    aria-label="Update cluster hostname"
    title="Update cluster hostname"
    isOpen={isOpen}
    variant={ModalVariant.small}
    hasNoBodyWrapper
  >
    <UpdateDay2ApiVipForm {...props} />
  </Modal>
);

export default UpdateDay2ApiVipModal;
