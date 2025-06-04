import React from 'react';
import {
	Button,
	ButtonVariant
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';

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
    <Modal
      title={title}
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
      {content}
    </Modal>
  );
};

export default ClusterPollingErrorModal;
