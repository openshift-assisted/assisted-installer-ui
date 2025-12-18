import * as React from 'react';
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

const DeleteCustomManifestModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} variant={ModalVariant.small}>
    <ModalHeader title={'Remove custom manifests'} />
    <ModalBody>
      <Content>
        All the data entered for custom manifests will be lost and there will not be any custom
        manifests included in the installation.
      </Content>
    </ModalBody>
    <ModalFooter>
      <Button
        data-testid="delete-manifest-submit"
        key="confirm"
        variant="danger"
        onClick={onDelete}
      >
        Remove
      </Button>
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default DeleteCustomManifestModal;
