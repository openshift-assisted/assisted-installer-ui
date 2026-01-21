import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

type ResetHostModalProps = {
  hostname?: string;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
};

const ResetHostModal: React.FC<ResetHostModalProps> = ({ isOpen, hostname, onClose, onReset }) => (
  <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.small}>
    <ModalHeader title="Reset Host" />
    <ModalBody>Are you sure you want to reset host{` ${hostname || ''}`} ?</ModalBody>
    <ModalFooter>
      <Button
        data-testid="reset-host-submit"
        key="confirm"
        variant={ButtonVariant.danger}
        onClick={onReset}
      >
        Reset
      </Button>
      <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default ResetHostModal;
