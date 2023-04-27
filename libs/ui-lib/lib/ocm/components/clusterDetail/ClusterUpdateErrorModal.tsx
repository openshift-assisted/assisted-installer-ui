import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

const ClusterUpdateErrorModal = () => (
  <Modal
    title="Unable to update cluster"
    isOpen
    variant={ModalVariant.small}
    showClose={false}
    titleIconVariant="danger"
    actions={[
      <Button
        key="refresh"
        variant={ButtonVariant.primary}
        onClick={() => window.location.reload()}
      >
        Refresh page
      </Button>,
    ]}
  >
    The service is down, undergoing maintenance, or experiencing another issue.
  </Modal>
);

export default ClusterUpdateErrorModal;
