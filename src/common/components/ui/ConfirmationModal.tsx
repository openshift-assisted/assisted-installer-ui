import * as React from 'react';
import { Modal, Button, ModalVariant, ButtonProps } from '@patternfly/react-core';

type ConfirmationModalProps = {
  title: string;
  content: React.ReactElement | string;
  confirmationButtonVariant?: ButtonProps['variant'];
  confirmationButtonText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  content,
  confirmationButtonText = 'Yes',
  confirmationButtonVariant = 'danger',
  onClose,
  onConfirm,
}) => (
  <Modal
    title={title}
    isOpen={true}
    onClose={onClose}
    variant={ModalVariant.small}
    actions={[
      <Button
        data-testid="confirm-modal-submit"
        key="confirm"
        variant={confirmationButtonVariant}
        onClick={onConfirm}
      >
        {confirmationButtonText}
      </Button>,
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    {content}
  </Modal>
);

export default ConfirmationModal;
