import React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';

const ClusterPollingErrorModal = () => {
  // TODO camador needs correct copy and to implement the retry action if there will be one
  const onClose = () => {
    console.log('%c should close', 'font-size: 16px; color: red');
  };

  return (
    <Modal
      title="The cluster details could not be updated"
      isOpen
      variant={ModalVariant.small}
      onClose={onClose}
    >
      This means that you wouldn't be able to see the latest cluster status. We are trying to update
      your cluster details. Please wait for this window to close, or <a>retry now</a>
    </Modal>
  );
};

export default ClusterPollingErrorModal;
