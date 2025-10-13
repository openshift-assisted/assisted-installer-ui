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

const ClusterUpdateErrorModal = () => (
  <Modal isOpen variant={ModalVariant.small} onClose={undefined}>
    <ModalHeader title="Unable to update cluster" titleIconVariant="danger" />
    <ModalBody>
      The service is down, undergoing maintenance, or experiencing another issue.
    </ModalBody>
    <ModalFooter>
      <Button
        key="refresh"
        variant={ButtonVariant.primary}
        onClick={() => window.location.reload()}
      >
        Refresh page
      </Button>
    </ModalFooter>
  </Modal>
);

export default ClusterUpdateErrorModal;
