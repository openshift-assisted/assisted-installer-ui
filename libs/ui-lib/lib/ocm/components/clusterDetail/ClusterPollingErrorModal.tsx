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

const defaultTitle = 'Unable to fetch the latest data';

const defaultContent =
  "There was an error fetching the latest data from the API. We'll try again, but if the data does not update in a few minutes, try refreshing the page.";

const ClusterPollingErrorModal = ({
  title = defaultTitle,
  content = defaultContent,
}: {
  title?: string;
  content?: string;
}) => {
  return (
    <Modal isOpen variant={ModalVariant.small} onClose={undefined}>
      <ModalHeader title={title} titleIconVariant="danger" />
      <ModalBody>{content}</ModalBody>
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
};

export default ClusterPollingErrorModal;
