import React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import UpdateDay2ApiVipForm, { UpdateDay2ApiVipFormProps } from './UpdateDay2ApiVipForm';

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
    title="Update cluster hostname"
    isOpen={isOpen}
    variant={ModalVariant.small}
    hasNoBodyWrapper
    onClose={onClose}
  >
    <UpdateDay2ApiVipForm {...props} onClose={onClose} />
  </Modal>
);

export default UpdateDay2ApiVipModal;
