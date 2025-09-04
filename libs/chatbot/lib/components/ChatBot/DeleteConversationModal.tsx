import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly-6/react-core';
import * as React from 'react';
import { getErrorMessage } from './helpers';
import { Conversation } from '@patternfly/chatbot';

type DeleteConversationModalProps = {
  onClose: VoidFunction;
  conversation: Conversation;
  onDelete: () => Promise<unknown>;
};

const DeleteConversationModal = ({
  onClose,
  conversation,
  onDelete,
}: DeleteConversationModalProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const handleDelete = React.useCallback(async () => {
    setError(undefined);
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, onClose]);

  return (
    <Modal
      isOpen
      onClose={isDeleting ? undefined : onClose}
      ouiaId="DeleteConversationModal"
      aria-labelledby="delete-conversation-modal"
      aria-describedby="modal-box-body-delete-conversation"
      variant="small"
      disableFocusTrap
    >
      <ModalHeader
        titleIconVariant="danger"
        title="Delete conversation?"
        labelId="delete-conversation-modal"
      />
      <ModalBody id="modal-box-body-delete-conversation">
        <Stack hasGutter>
          <StackItem>
            Are you sure you want to delete conversation from <b>{conversation.text}</b>?
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title="Failed to delete conversation">
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="danger"
          onClick={() => void handleDelete()}
          isDisabled={isDeleting}
          isLoading={isDeleting}
        >
          Delete
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConversationModal;
