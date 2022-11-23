import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

const ClusterPollingErrorModal = () => {
  const onClose = () => {
    window.location.reload();
  };

  return (
    <Modal
      title="Unable to fetch the latest data"
      isOpen
      variant={ModalVariant.small}
      onClose={onClose}
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
      A network error caused an error fetching the latest data from the API. We'll try again. If the
      data does not update in a few minutes, try refreshing.
    </Modal>
  );
};

export default ClusterPollingErrorModal;
