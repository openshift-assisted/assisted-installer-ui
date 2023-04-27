import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Modal,
  ModalVariant,
  ButtonVariant,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { getApiErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { ErrorState, LoadingState } from '../../../common';
import { ClustersAPI } from '../../services/apis';

const CancelInstallationModal: React.FC = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const { cancelInstallationDialog } = useModalDialogsContext();
  const { data, isOpen, close: onClose } = cancelInstallationDialog;
  const clusterId = data?.clusterId;

  if (!clusterId) {
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setError(null);
      const { data } = await ClustersAPI.cancel(clusterId);
      dispatch(updateCluster(data));
      onClose();
    } catch (e) {
      handleApiError(e, () => {
        setError({ title: 'Failed to abort cluster installation', message: getApiErrorMessage(e) });
      });
    }
    setIsSubmitting(false);
  };

  const getModalContent = () => {
    if (isSubmitting) {
      return <LoadingState content="Aborting cluster installation..." />;
    }
    if (error) {
      return <ErrorState title={error.title} content={error.message} />;
    }
    return (
      <TextContent>
        <Text component="p">
          This will abort cluster installation. Are you sure you want to proceed?
        </Text>
      </TextContent>
    );
  };

  return (
    <Modal
      title="Abort Cluster Installation"
      isOpen={isOpen}
      variant={ModalVariant.small}
      actions={[
        <Button
          key="submit"
          variant={ButtonVariant.danger}
          onClick={() => {
            void handleSubmit();
          }}
          isDisabled={isSubmitting}
        >
          Abort Installation
        </Button>,
        <Button
          key="cancel"
          variant={ButtonVariant.link}
          onClick={onClose}
          isDisabled={isSubmitting}
        >
          Cancel
        </Button>,
      ]}
      onClose={onClose}
    >
      {getModalContent()}
    </Modal>
  );
};

export default CancelInstallationModal;
