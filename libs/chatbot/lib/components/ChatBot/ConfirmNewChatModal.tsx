import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly-6/react-core';

const ConfirmNewChatModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}) => {
  const btnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    btnRef.current?.focus();
  }, []);

  return (
    <Modal variant={ModalVariant.small} isOpen onClose={onCancel}>
      <ModalHeader title="Start a new chat?" />
      <ModalBody>
        Starting a new chat will permanently erase your current conversation. If you want to save
        any information, please copy it before proceeding.
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} ref={btnRef}>
          Erase and start a new chat
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmNewChatModal;
