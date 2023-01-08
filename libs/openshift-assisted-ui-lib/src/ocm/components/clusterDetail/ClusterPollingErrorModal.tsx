import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

const ClusterPollingErrorModal = () => {
  return (
    <Modal
      title="Unable to fetch the latest data"
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
      There was an error fetching the latest data from the API. We'll try again, but if the data
      does not update in a few minutes, try refreshing the page.
    </Modal>
  );
};

export default ClusterPollingErrorModal;
